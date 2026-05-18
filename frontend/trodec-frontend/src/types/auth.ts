export type UserRole = "consumer" | "expert" | "brand_admin";
export type AuthMode = "signin" | "signup";

export interface SignupField {
  name: string;
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  required: boolean;
}

export interface RoleConfig {
  id: UserRole;
  label: string;
  signupFields: SignupField[];
}

export const roleConfigs: Record<UserRole, RoleConfig> = {
  consumer: {
    id: "consumer",
    label: "User",
    signupFields: [
      { name: "fullName", label: "Full Name", type: "text", placeholder: "John Doe", required: true },
    ],
  },
  expert: {
    id: "expert",
    label: "Expert",
    signupFields: [
      { name: "fullName", label: "Full Name", type: "text", placeholder: "Jane Smith", required: true },
      { name: "expertise", label: "Expertise", type: "text", placeholder: "Finance, Tech", required: true },
      { name: "linkedinUrl", label: "LinkedIn Profile", type: "text", placeholder: "https://linkedin.com/in/username", required: false },
    ],
  },
  brand_admin: {
    id: "brand_admin",
    label: "Brand",
    signupFields: [
      { name: "fullName", label: "Full Name", type: "text", placeholder: "John Doe", required: true },
      { name: "brandName", label: "Brand Name", type: "text", placeholder: "Acme Inc.", required: true },
    ],
  },
};