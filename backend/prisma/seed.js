// This is a manual migration script to be run after updating the schema
const prisma = require('../db/prisma-db');

async function main() {
  console.log('Starting migration...');

  // Create Analytics table with initial data
  const analytics = await prisma.analytics.create({
    data: {
      totalVoters: 0,
      totalCandidates: 0,
      totalPositions: 0,
      activeElections: 0,
      completedElections: 0,
      totalVotesCast: 0,
      voterTurnout: 0,
    },
  });
  console.log('Created initial analytics record:', analytics);

  // Get current date for election start
  const today = new Date();

  // Set end date to 7 days from now
  const endDate = new Date();
  endDate.setDate(today.getDate() + 7);

  // Create a default election that starts today
  const election = await prisma.election.create({
    data: {
      title: 'Student Council Election 2025',
      description: 'Annual election for the student council positions',
      startDate: today,
      endDate: endDate,
      status: 'ONGOING', // Set as ongoing since it starts today
      isActive: true, // Set as active
      settings: {
        create: {
          allowMultipleVotes: false,
          resultsVisibility: 'AFTER_END',
          requireVerification: true,
          allowAbstention: false,
        },
      },
    },
  });
  console.log('Created default election:', election);

  // Get all positions
  const positions = await prisma.positions.findMany({
    where: {
      del_flg: false,
    },
  });

  // Link positions to the election
  if (positions.length > 0) {
    const electionPositions = await prisma.electionPosition.createMany({
      data: positions.map((position) => ({
        electionId: election.id,
        positionId: position.id,
      })),
    });
    console.log(`Linked ${electionPositions.count} positions to the election`);
  }

  // Format dates for the announcement
  const startDateFormatted = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const endDateFormatted = endDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Create a welcome announcement
  const announcement = await prisma.announcement.create({
    data: {
      electionId: election.id,
      title: 'Student Council Elections Now Open!',
      content: `We are excited to announce that the student council elections are now open! Voting begins today, ${startDateFormatted}, and will continue until ${endDateFormatted}. Please log in to cast your votes for your preferred candidates.`,
      isPublished: true,
    },
  });
  console.log('Created welcome announcement:', announcement);

  console.log('Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
