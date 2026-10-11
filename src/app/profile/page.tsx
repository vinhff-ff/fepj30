import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMe } from "@/modules/auth/services/auth.service";
import type { User } from "@/modules/auth/types";
import { buildMetadata } from "@/lib/seo";
import { ProfileView } from "./profile-view";
import "./profile.scss";

export const dynamic = "force-dynamic";

function generateMetadata(): Metadata {
  return buildMetadata("/profile", {
    title: "Trang cá nhân",
    description: "Xem và quản lý thông tin tài khoản của bạn.",
  });
}

async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/");
  }

  let user: User;
  try {
    user = await getMe(token);
  } catch {
    redirect("/");
  }

  return <ProfileView user={user} />;
}

export default ProfilePage;
export { generateMetadata };
