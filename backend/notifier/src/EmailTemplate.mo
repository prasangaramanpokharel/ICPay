import Text "mo:core/Text";
import Nat "mo:core/Nat";

module {
  public func renderExpirySoon(
    bucketName: Text,
    bucketId: Text,
    daysLeft: Nat
  ) : Text {
    let daysStr = Nat.toText(daysLeft);
    let renewUrl = "https://icpay.app/bucket/" # bucketId;

    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;background-color:#ffffff;\">" #
    "<tbody><tr><td align=\"center\" style=\"padding:32px 16px;\">" #
    "<table role=\"presentation\" width=\"580\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;max-width:580px;background-color:#ffffff;\">" #
    "<tbody><tr><td style=\"padding:0 0 20px;border-bottom:1px solid #e4e4e7;\">" #
    "<table role=\"presentation\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><tbody><tr>" #
    "<td valign=\"middle\" style=\"padding-right:8px;\">" #
    "<img src=\"https://icpay.app/images/logo/logo-72.webp\" width=\"24\" height=\"24\" alt=\"ICPay\" style=\"display:block;width:24px;height:24px;border:0;\">" #
    "</td><td valign=\"middle\" style=\"white-space:nowrap;\">" #
    "<span style=\"font-size:19px;line-height:24px;font-weight:700;color:#18181b;letter-spacing:-0.5px;\">ICPay</span>" #
    "<span style=\"font-size:14px;line-height:24px;color:#71717a;\">&nbsp;Cloud Storage</span>" #
    "</td></tr></tbody></table></td></tr>" #
    "<tr><td style=\"padding:28px 0;\">" #
    "<p style=\"margin:0 0 12px;font-size:12px;line-height:18px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:#71717a;\">Storage Plan Notification</p>" #
    "<h1 style=\"margin:0 0 16px;font-size:24px;line-height:32px;font-weight:700;color:#18181b;\">Your storage bucket is expiring soon</h1>" #
    "<p style=\"margin:0 0 20px;font-size:14px;line-height:23px;color:#52525b;\">Your ICPay Cloud Storage bucket <strong style=\"color:#18181b;\">" # bucketName # "</strong> has <strong style=\"color:#18181b;\">" # daysStr # " day(s)</strong> remaining on its current plan. Please renew your plan to help avoid service interruptions.</p>" #
    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;margin:24px 0;border-top:1px solid #e4e4e7;border-bottom:1px solid #e4e4e7;\"><tbody>" #
    "<tr><td valign=\"top\" style=\"padding:14px 12px 14px 0;font-size:13px;line-height:20px;color:#71717a;\">Bucket Name</td><td align=\"right\" valign=\"top\" style=\"padding:14px 0;font-size:13px;line-height:20px;font-weight:600;color:#18181b;word-break:break-word;\">" # bucketName # "</td></tr>" #
    "<tr><td valign=\"top\" style=\"padding:14px 12px 14px 0;font-size:13px;line-height:20px;color:#71717a;border-top:1px solid #f4f4f5;\">Canister ID</td><td align=\"right\" valign=\"top\" style=\"padding:14px 0;font-size:12px;line-height:20px;font-family:monospace;color:#52525b;border-top:1px solid #f4f4f5;word-break:break-all;\">" # bucketId # "</td></tr>" #
    "<tr><td valign=\"top\" style=\"padding:14px 12px 14px 0;font-size:13px;line-height:20px;color:#71717a;border-top:1px solid #f4f4f5;\">Days Remaining</td><td align=\"right\" valign=\"top\" style=\"padding:14px 0;font-size:13px;line-height:20px;font-weight:600;color:#18181b;border-top:1px solid #f4f4f5;\">" # daysStr # " day(s)</td></tr>" #
    "</tbody></table>" #
    "<table role=\"presentation\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin:24px 0;\"><tbody><tr>" #
    "<td align=\"left\" bgcolor=\"#18181b\" style=\"border-radius:6px;background-color:#18181b;\">" #
    "<a href=\"" # renewUrl # "\" style=\"display:inline-block;padding:12px 22px;border:1px solid #18181b;border-radius:6px;background-color:#18181b;color:#ffffff;font-size:14px;line-height:20px;font-weight:600;text-decoration:none;\">Renew Storage Plan</a>" #
    "</td></tr></tbody></table>" #
    "<p style=\"margin:28px 0 8px;font-size:14px;line-height:22px;font-weight:600;color:#18181b;\">Annual Plan</p>" #
    "<p style=\"margin:0 0 24px;font-size:13px;line-height:22px;color:#52525b;\">Choose the 365-day plan to receive two additional months at no extra cost, according to the current plan offer, and maintain continuous storage service.</p>" #
    "<h2 style=\"margin:28px 0 12px;font-size:15px;line-height:22px;font-weight:600;color:#18181b;\">If you do not renew</h2>" #
    "<p style=\"margin:0 0 12px;font-size:13px;line-height:22px;color:#52525b;\"><strong style=\"color:#18181b;\">Days 1–7 — Grace Period:</strong> The bucket is marked as expired and uploads are disabled. Existing CDN files remain publicly accessible.</p>" #
    "<p style=\"margin:0 0 12px;font-size:13px;line-height:22px;color:#52525b;\"><strong style=\"color:#18181b;\">Days 8–21 — Frozen Period:</strong> Public CDN access is suspended. Only the authenticated owner can access the bucket and renew the plan.</p>" #
    "<p style=\"margin:0 0 20px;font-size:13px;line-height:22px;color:#52525b;\"><strong style=\"color:#18181b;\">After Day 21 — Tombstoned:</strong> Unclaimed buckets are marked as tombstoned according to the storage lifecycle policy.</p>" #
    "<p style=\"margin:24px 0 0;font-size:13px;line-height:22px;color:#52525b;\">We recommend renewing before your current plan expires to minimize disruption to your applications and CDN delivery.</p>" #
    "</td></tr><tr><td style=\"padding:20px 0;border-top:1px solid #e4e4e7;\">" #
    "<p style=\"margin:0 0 12px;font-size:12px;line-height:20px;color:#71717a;\">This automated notification was sent by <strong style=\"color:#52525b;\">icpay_notifier</strong>, a canister running on the Internet Computer.</p>" #
    "<p style=\"margin:0;font-size:12px;line-height:22px;\"><a href=\"https://icpay.app/bucket\" style=\"color:#18181b;text-decoration:underline;\">Dashboard</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href=\"https://icpay.app/bucket/docs\" style=\"color:#52525b;text-decoration:underline;\">Documentation</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href=\"https://icpay.app\" style=\"color:#52525b;text-decoration:underline;\">ICPay Home</a></p>" #
    "</td></tr></tbody></table></td></tr></tbody></table>"
  };

  public func renderGracePeriod(
    bucketName: Text,
    bucketId: Text
  ) : Text {
    let renewUrl = "https://icpay.app/bucket/" # bucketId;

    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;background-color:#ffffff;\">" #
    "<tbody><tr><td align=\"center\" style=\"padding:32px 16px;\">" #
    "<table role=\"presentation\" width=\"580\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;max-width:580px;background-color:#ffffff;\">" #
    "<tbody><tr><td style=\"padding:0 0 20px;border-bottom:1px solid #e4e4e7;\">" #
    "<table role=\"presentation\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><tbody><tr>" #
    "<td valign=\"middle\" style=\"padding-right:8px;\">" #
    "<img src=\"https://icpay.app/images/logo/logo-72.webp\" width=\"24\" height=\"24\" alt=\"ICPay\" style=\"display:block;width:24px;height:24px;border:0;\">" #
    "</td><td valign=\"middle\" style=\"white-space:nowrap;\">" #
    "<span style=\"font-size:19px;line-height:24px;font-weight:700;color:#18181b;letter-spacing:-0.5px;\">ICPay</span>" #
    "<span style=\"font-size:14px;line-height:24px;color:#71717a;\">&nbsp;Cloud Storage</span>" #
    "</td></tr></tbody></table></td></tr>" #
    "<tr><td style=\"padding:28px 0;\">" #
    "<p style=\"margin:0 0 12px;font-size:12px;line-height:18px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:#ef4444;\">Action Required · Read-Only Mode</p>" #
    "<h1 style=\"margin:0 0 16px;font-size:24px;line-height:32px;font-weight:700;color:#18181b;\">Your bucket plan has expired</h1>" #
    "<p style=\"margin:0 0 20px;font-size:14px;line-height:23px;color:#52525b;\">The storage plan for bucket <strong style=\"color:#18181b;\">" # bucketName # "</strong> has expired and is now operating in the <strong style=\"color:#18181b;\">7-day read-only grace period</strong>.</p>" #
    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;margin:24px 0;border-top:1px solid #e4e4e7;border-bottom:1px solid #e4e4e7;\"><tbody>" #
    "<tr><td valign=\"top\" style=\"padding:14px 12px 14px 0;font-size:13px;line-height:20px;color:#71717a;\">Bucket Name</td><td align=\"right\" valign=\"top\" style=\"padding:14px 0;font-size:13px;line-height:20px;font-weight:600;color:#18181b;word-break:break-word;\">" # bucketName # "</td></tr>" #
    "<tr><td valign=\"top\" style=\"padding:14px 12px 14px 0;font-size:13px;line-height:20px;color:#71717a;border-top:1px solid #f4f4f5;\">Canister ID</td><td align=\"right\" valign=\"top\" style=\"padding:14px 0;font-size:12px;line-height:20px;font-family:monospace;color:#52525b;border-top:1px solid #f4f4f5;word-break:break-all;\">" # bucketId # "</td></tr>" #
    "<tr><td valign=\"top\" style=\"padding:14px 12px 14px 0;font-size:13px;line-height:20px;color:#71717a;border-top:1px solid #f4f4f5;\">Current Status</td><td align=\"right\" valign=\"top\" style=\"padding:14px 0;font-size:13px;line-height:20px;font-weight:600;color:#ef4444;border-top:1px solid #f4f4f5;\">EXPIRED (Grace Period)</td></tr>" #
    "</tbody></table>" #
    "<table role=\"presentation\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin:24px 0;\"><tbody><tr>" #
    "<td align=\"left\" bgcolor=\"#18181b\" style=\"border-radius:6px;background-color:#18181b;\">" #
    "<a href=\"" # renewUrl # "\" style=\"display:inline-block;padding:12px 22px;border:1px solid #18181b;border-radius:6px;background-color:#18181b;color:#ffffff;font-size:14px;line-height:20px;font-weight:600;text-decoration:none;\">Restore Full Access · Renew Bucket →</a>" #
    "</td></tr></tbody></table>" #
    "<h2 style=\"margin:28px 0 12px;font-size:15px;line-height:22px;font-weight:600;color:#18181b;\">What happens during the Grace Period?</h2>" #
    "<p style=\"margin:0 0 12px;font-size:13px;line-height:22px;color:#52525b;\">• <strong style=\"color:#18181b;\">Existing files stay live:</strong> Public CDN delivery continues uninterrupted so live websites or app images will not break immediately.</p>" #
    "<p style=\"margin:0 0 12px;font-size:13px;line-height:22px;color:#52525b;\">• <strong style=\"color:#18181b;\">Uploads are paused:</strong> New file uploads and edits are temporarily disabled until the plan is renewed.</p>" #
    "<p style=\"margin:0 0 20px;font-size:13px;line-height:22px;color:#52525b;\">• <strong style=\"color:#18181b;\">After Day 7:</strong> If not renewed within 7 days, the bucket will be frozen and public CDN access will be paused.</p>" #
    "<p style=\"margin:24px 0 0;font-size:13px;line-height:22px;color:#52525b;\">Renewing now extends your bucket without altering any file paths, hashes, or DNS configs.</p>" #
    "</td></tr><tr><td style=\"padding:20px 0;border-top:1px solid #e4e4e7;\">" #
    "<p style=\"margin:0 0 12px;font-size:12px;line-height:20px;color:#71717a;\">This automated notification was sent by <strong style=\"color:#52525b;\">icpay_notifier</strong>, a canister running on the Internet Computer.</p>" #
    "<p style=\"margin:0;font-size:12px;line-height:22px;\"><a href=\"https://icpay.app/bucket\" style=\"color:#18181b;text-decoration:underline;\">Dashboard</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href=\"https://icpay.app/bucket/docs\" style=\"color:#52525b;text-decoration:underline;\">Documentation</a></p>" #
    "</td></tr></tbody></table></td></tr></tbody></table>"
  };
}
