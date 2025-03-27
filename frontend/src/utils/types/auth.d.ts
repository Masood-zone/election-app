interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: string;
}

interface Voter {
  studentId: string;
  studentName: string;
  email: string;
  password: string;
  role: string;
}

// Authentication response interfaces
interface AdminAuth {
  status: string;
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

interface UserAuth {
  status: string;
  token: string;
  user: {
    studentId: string;
    studentName: string;
    email: string;
    role: string;
    telephone: string;
  };
}

interface VoterAuth {
  status: string;
  token: string;
  voter: {
    studentId: string;
    studentName: string;
    email: string;
    role: string;
  };
}

// Login request types
interface AdminLoginRequest {
  email: string;
  password: string;
}

interface VoterLoginRequest {
  studentId: string;
  password: string;
}

// Combined login type for flexibility
type LoginRequest = AdminLoginRequest | VoterLoginRequest;

// Registration request types
interface AdminRegisterRequest
  extends Pick<User, "fullName" | "email" | "password"> {
  telephone?: string;
}

interface VoterRegisterRequest {
  studentId: string;
  studentName: string;
  email: string;
  password: string;
  telephone?: string;
}

// Auth store state
interface AuthState {
  token: string | null;
  user: (AdminAuth["user"] | VoterAuth["user"]) | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  // Actions
  login: (data: {
    token: string;
    user: AdminAuth["user"] | UserAuth["user"];
  }) => void;
  logout: () => void;
}
