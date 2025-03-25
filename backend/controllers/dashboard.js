const prisma = require('../db/prisma-db');

// Get dashboard analytics
const getDashboardAnalytics = async (req, res, next) => {
  try {
    // Get counts
    const [
      totalVoters,
      activeVoters,
      totalCandidates,
      totalPositions,
      elections,
      totalVotes,
    ] = await Promise.all([
      // Total registered voters
      prisma.voters.count({
        where: { del_flg: false },
      }),
      // Active voters (those who have voted)
      prisma.voters.count({
        where: {
          del_flg: false,
          voting: {
            some: {},
          },
        },
      }),
      // Total candidates
      prisma.candidates.count({
        where: { del_flag: false },
      }),
      // Total positions
      prisma.positions.count({
        where: { del_flg: false },
      }),
      // Elections with counts
      prisma.election.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          startDate: true,
          endDate: true,
          isActive: true,
          _count: {
            select: {
              votes: true,
            },
          },
        },
      }),
      // Total votes cast
      prisma.voting.count(),
    ]);

    // Calculate election statistics
    const activeElections = elections.filter(
      (e) => e.status === 'ONGOING' && e.isActive,
    ).length;
    const upcomingElections = elections.filter(
      (e) => e.status === 'UPCOMING',
    ).length;
    const completedElections = elections.filter(
      (e) => e.status === 'COMPLETED',
    ).length;

    // Calculate voter turnout
    const voterTurnout =
      totalVoters > 0 ? (activeVoters / totalVoters) * 100 : 0;

    // Get recent votes (last 10)
    const recentVotes = await prisma.voting.findMany({
      take: 10,
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        voters: {
          select: {
            studentId: true,
            studentName: true,
          },
        },
        positions: {
          select: {
            positionName: true,
          },
        },
        candidates: {
          select: {
            candidateName: true,
          },
        },
        election: {
          select: {
            title: true,
          },
        },
      },
    });

    // Get top positions by vote count
    const positionVoteCounts = await prisma.voting.groupBy({
      by: ['positionId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    // Get position details for the top positions
    const topPositions = await Promise.all(
      positionVoteCounts.map(async (item) => {
        const position = await prisma.positions.findUnique({
          where: { id: item.positionId },
          select: {
            id: true,
            positionName: true,
          },
        });
        return {
          ...position,
          voteCount: item._count.id,
        };
      }),
    );

    // Save analytics record
    await prisma.analytics.create({
      data: {
        totalVoters,
        totalCandidates,
        totalPositions,
        activeElections,
        completedElections,
        totalVotesCast: totalVotes,
        voterTurnout,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalVoters,
          activeVoters,
          totalCandidates,
          totalPositions,
          totalVotes,
          voterTurnout: Number.parseFloat(voterTurnout.toFixed(2)),
        },
        elections: {
          total: elections.length,
          active: activeElections,
          upcoming: upcomingElections,
          completed: completedElections,
        },
        recentVotes,
        topPositions,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    next(new HttpException(500, error.message));
  }
};

// Get election results
const getElectionResults = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if election exists
    const election = await prisma.election.findUnique({
      where: { id },
      include: {
        settings: true,
      },
    });

    if (!election) {
      return res.status(404).json({
        status: 'fail',
        message: 'Election not found',
      });
    }

    // Check if results should be visible
    const now = new Date();
    const isAdmin = req.user && req.user.isAdmin;

    // If not admin and results are restricted
    if (!isAdmin && election.settings?.resultsVisibility === 'ADMIN_ONLY') {
      return res.status(403).json({
        status: 'fail',
        message: 'Election results are only visible to administrators',
      });
    }

    // If results should only be visible after election ends
    if (
      !isAdmin &&
      election.settings?.resultsVisibility === 'AFTER_END' &&
      now < election.endDate
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'Election results will be available after the election ends',
      });
    }

    // Get votes grouped by position and candidate
    const voteResults = await prisma.voting.groupBy({
      by: ['positionId', 'candidateId'],
      where: {
        electionId: id,
      },
      _count: {
        id: true,
      },
    });

    // Get total votes for this election
    const totalVotes = await prisma.voting.count({
      where: {
        electionId: id,
      },
    });

    // Get total eligible voters
    const totalEligibleVoters = await prisma.voters.count({
      where: {
        del_flg: false,
      },
    });

    // Get unique voters who participated
    const uniqueVoters = await prisma.voting.groupBy({
      by: ['voterId'],
      where: {
        electionId: id,
      },
    });

    // Calculate voter turnout
    const voterTurnout =
      totalEligibleVoters > 0
        ? (uniqueVoters.length / totalEligibleVoters) * 100
        : 0;

    // Get detailed results with position and candidate info
    const detailedResults = await Promise.all(
      voteResults.map(async (result) => {
        const position = await prisma.positions.findUnique({
          where: { id: result.positionId },
          select: {
            id: true,
            positionName: true,
            description: true,
          },
        });

        const candidate = await prisma.candidates.findUnique({
          where: { id: result.candidateId },
          select: {
            id: true,
            candidateName: true,
            profile: true,
          },
        });

        return {
          position: position || {
            id: result.positionId,
            positionName: 'Unknown Position',
          },
          candidate: candidate || {
            id: result.candidateId,
            candidateName: 'Unknown Candidate',
          },
          voteCount: result._count.id,
        };
      }),
    );

    // Group results by position
    const resultsByPosition = {};
    detailedResults.forEach((result) => {
      const positionId = result.position.id;
      if (!resultsByPosition[positionId]) {
        resultsByPosition[positionId] = {
          position: result.position,
          candidates: [],
          totalVotesForPosition: 0,
        };
      }
      resultsByPosition[positionId].candidates.push({
        candidate: result.candidate,
        voteCount: result.voteCount,
        percentage:
          totalVotes > 0
            ? Number.parseFloat(
                ((result.voteCount / totalVotes) * 100).toFixed(2),
              )
            : 0,
      });
      resultsByPosition[positionId].totalVotesForPosition += result.voteCount;
    });

    // Sort candidates by vote count within each position
    Object.values(resultsByPosition).forEach((positionResult) => {
      positionResult.candidates.sort((a, b) => b.voteCount - a.voteCount);
    });

    res.status(200).json({
      status: 'success',
      data: {
        election: {
          id: election.id,
          title: election.title,
          startDate: election.startDate,
          endDate: election.endDate,
          status: election.status,
        },
        summary: {
          totalVotes,
          totalEligibleVoters,
          voterTurnout: Number.parseFloat(voterTurnout.toFixed(2)),
          uniqueVoters: uniqueVoters.length,
        },
        results: Object.values(resultsByPosition),
      },
    });
  } catch (error) {
    console.error('Error fetching election results:', error);
    next(new HttpException(500, error.message));
  }
};

// Get historical analytics data
const getHistoricalAnalytics = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number.parseInt(days));

    // Get analytics records for the period
    const analyticsData = await prisma.analytics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Get votes per day for the period
    const votesPerDay = await prisma.voting.groupBy({
      by: ['timestamp'],
      _count: {
        id: true,
      },
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Format votes per day for charting
    const formattedVotesPerDay = votesPerDay.map((item) => ({
      date: item.timestamp.toISOString().split('T')[0],
      count: item._count.id,
    }));

    // Group by date to handle multiple votes on the same day
    const votesPerDayMap = formattedVotesPerDay.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = 0;
      }
      acc[item.date] += item.count;
      return acc;
    }, {});

    // Convert back to array format
    const chartData = Object.entries(votesPerDayMap).map(([date, count]) => ({
      date,
      count,
    }));

    res.status(200).json({
      status: 'success',
      data: {
        analyticsData,
        votesPerDay: chartData,
      },
    });
  } catch (error) {
    console.error('Error fetching historical analytics:', error);
    next(new HttpException(500, error.message));
  }
};

// Export all functions
module.exports = {
  getDashboardAnalytics,
  getElectionResults,
  getHistoricalAnalytics,
};
