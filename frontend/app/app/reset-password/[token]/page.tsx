"use client";

import { ResetPassword } from "@/components/ResetPassword"; 

interface Props {
  params: {
    token: string;
  };
}

export default function ResetPasswordPage({ params }: Props) {
  return <ResetPassword token={params.token} />;
}