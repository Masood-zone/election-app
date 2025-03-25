interface UpdateProfileRequest {
  studentId: string;
  studentName: string;
  email: string;
  telephone?: string;
}

interface UpdateProfileResponse {
  status: string;
  message: string;
  voter: {
    studentId: string;
    studentName: string;
    email: string;
    telephone?: string;
    role: string;
    del_flg: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
