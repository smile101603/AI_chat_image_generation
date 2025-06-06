import React from "react";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import TollIcon from "@mui/icons-material/Toll";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";

import { Gallery } from "@/components/shared/Gallery";
import Header from "@/components/shared/Header";
import { getUserImages } from "@/lib/actions/image.actions";
import { getUserById } from "@/lib/actions/user.actions";

// Helper function to format date
const formatAccountCreationDate = (createdAt: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(createdAt);
};

// Low Balance Notification Component
const LowBalanceNotification = ({ balance }: { balance: number }) => {
  if (balance > 5) return null;

  return (
    <div className="p-4 flex flex-row gap-2 rounded-[28px] bg-yellow-50 border-l-4 border-yellow-400 overflow-hidden shadow-sm drop-shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-xl">
      <span className="text-yellow-700 font-semibold">Alert:</span>
      <span className="text-yellow-600">
        {balance === 0 ? "You've run out of tokens." : "Low token balance."}
      </span>
    </div>
  );
};

// Token Top-up Banner Component
const TokenTopUpBanner = () => {
  return (
    <div className="profile-token-banner">
      <div className="profile-token-banner-content">
        <RocketLaunchOutlinedIcon className="profile-token-banner-icon" />
        <div>
          <h3 className="text-xl font-bold mb-2">Need more tokens?</h3>
          <p className="text-sm">
            Unlock more image generation and manipulation capabilities!
          </p>
        </div>
      </div>
      <Link href="/tokens" className="modal-button-second">
        Top up tokens
      </Link>
    </div>
  );
};

const ProfilePage = async (props: SearchParamProps) => {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;
  const authResponse = await auth();

  if (!authResponse?.userId) redirect("/sign-in");

  const user = await getUserById(authResponse.userId);
  const images = await getUserImages({ page, userId: user._id });

  return (
    <>
      <Header
        title={
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName} profile`
            : user.username
              ? `${user.username}'s profile`
              : "Profile"
        }
      />
      <section className="profile-container">
        {/* Low Balance Notification */}
        <LowBalanceNotification balance={user.tokenBalance} />

        <div className="profile-grid">
          {/* Tokens available card */}
          <div className="profile-grid-card">
            <div className="profile-grid-card_token-container bg-yellow-100">
              <TollIcon className="profile-grid-card_token-icon text-yellow-500" />
            </div>
            <div>
              <p className="profile-grid-card-title">Tokens available</p>
              <h2 className="profile-grid-card-value text-yellow-600">
                {user.tokenBalance.toLocaleString("pl-PL", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h2>
            </div>
          </div>

          {/* Image Manipulation Card */}
          <div className="profile-grid-card">
            <div className="profile-grid-card_token-container bg-green-100">
              <ImageOutlinedIcon className="profile-grid-card_token-icon text-green-600" />
            </div>
            <div>
              <p className="profile-grid-card-title">Images saved</p>
              <h2 className="profile-grid-card-value text-green-700">
                {images?.data.length}
              </h2>
            </div>
          </div>
        </div>

        {/* Token Top-up Banner */}
        <TokenTopUpBanner />

        {/* Additional Account Information */}
        <div className="profile-details">
          <h3 className="profile-details-title ">Profile details</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <CalendarTodayOutlinedIcon className="profile-details-text mr-3" />
              <span className="profile-details-text">
                Created: {formatAccountCreationDate(user.createdAt)}
              </span>
            </div>
            <div className="flex items-center">
              <MailOutlineIcon className="profile-details-text mr-3" />
              <span className="profile-details-text">
                Email: {user.email || "Not provided"}
              </span>
            </div>
          </div>
        </div>

        {/* Image Gallery Section */}
        <Gallery
          images={images?.data}
          totalPages={images?.totalPages}
          page={page}
        />
      </section>
    </>
  );
};

export default ProfilePage;
