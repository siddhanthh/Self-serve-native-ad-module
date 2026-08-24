"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CampaignForm, { CampaignData } from "@/components/CampaignForm";

export default function NewCampaignPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: CampaignData) => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/campaigns/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const resData = await res.json();
            if (!res.ok) {
                throw new Error(resData.error || 'Failed to submit campaign');
            }
            alert("Success! Your campaign has been submitted for moderation.");
            router.push('/dashboard');
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <CampaignForm 
            onSubmit={handleSubmit}
            submitButtonText="Submit for Approval"
            isSubmitting={isSubmitting}
            titleText="Create New Campaign"
            subtitleText="Submit your ad for moderator approval."
        />
    );
}