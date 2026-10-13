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

    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#09090b;padding:40px 16px;font-family:Arial,Helvetica,sans-serif;\"><tbody><tr><td align=\"center\">" #
    "<table role=\"presentation\" width=\"580\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;max-width:580px;background-color:#18181b;border:1px solid #3f3f46;border-radius:12px;overflow:hidden;\"><tbody><tr>" #
    "<td style=\"padding:28px 32px;border-bottom:1px solid #3f3f46;\"><table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><tbody><tr>" #
    "<td align=\"left\"><span style=\"font-size:20px;font-weight:700;letter-spacing:-0.5px;color:#fafafa;\">ICPay</span> <span style=\"font-size:14px;color:#a1a1aa;font-weight:400;\">Cloud Storage</span></td>" #
    "<td align=\"right\"><span style=\"font-size:11px;font-weight:600;color:#d4d4d8;border:1px solid #52525b;border-radius:6px;padding:5px 9px;\">ACTION REQUIRED</span></td>" #
    "</tr></tbody></table></td></tr>" #
    "<tr><td style=\"padding:32px;\">" #
    "<h1 style=\"margin:0 0 12px;font-size:24px;line-height:32px;font-weight:700;letter-spacing:-0.6px;color:#fafafa;\">Your storage bucket is expiring soon</h1>" #
    "<p style=\"margin:0 0 28px;font-size:14px;line-height:23px;color:#a1a1aa;\">Your ICPay Cloud Storage bucket <strong style=\"color:#fafafa;\">" # bucketName # "</strong> has <strong style=\"color:#e4e4e7;\">" # daysStr # " day(s)</strong> remaining on its active storage plan. Renew your plan to avoid service interruptions and maintain uninterrupted access to your storage.</p>" #
    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#09090b;border:1px solid #3f3f46;border-radius:8px;margin-bottom:24px;\"><tbody><tr><td style=\"padding:20px;\">" #
    "<p style=\"margin:0 0 18px;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:#a1a1aa;\">Storage Details</p>" #
    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><tbody>" #
    "<tr><td style=\"padding:0 12px 14px 0;font-size:13px;color:#a1a1aa;\">Bucket Name</td><td align=\"right\" style=\"padding-bottom:14px;font-size:13px;font-weight:600;color:#fafafa;word-break:break-word;\">" # bucketName # "</td></tr>" #
    "<tr><td style=\"padding:0 12px 14px 0;font-size:13px;color:#a1a1aa;\">Canister ID</td><td align=\"right\" style=\"padding-bottom:14px;font-size:12px;font-family:monospace;color:#d4d4d8;word-break:break-all;\">" # bucketId # "</td></tr>" #
    "<tr><td style=\"padding-right:12px;font-size:13px;color:#a1a1aa;\">Days Remaining</td><td align=\"right\" style=\"font-size:13px;font-weight:600;color:#fafafa;\">" # daysStr # " day(s)</td></tr>" #
    "</tbody></table></td></tr></tbody></table>" #
    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin-bottom:24px;\"><tbody><tr><td align=\"center\">" #
    "<a href=\"" # renewUrl # "\" style=\"display:inline-block;background-color:#fafafa;color:#18181b;font-size:14px;font-weight:600;line-height:20px;text-decoration:none;padding:13px 28px;border-radius:7px;border:1px solid #fafafa;\">Renew Storage Plan →</a>" #
    "</td></tr></tbody></table>" #
    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#27272a;border:1px solid #3f3f46;border-radius:8px;margin-bottom:28px;\"><tbody><tr><td style=\"padding:16px 18px;\">" #
    "<p style=\"margin:0 0 6px;font-size:13px;font-weight:600;color:#fafafa;\">Save with the Annual Plan</p>" #
    "<p style=\"margin:0;font-size:13px;line-height:21px;color:#a1a1aa;\">Choose the 365-day plan to receive two additional months at no extra cost and keep your storage active for longer.</p>" #
    "</td></tr></tbody></table>" #
    "<h2 style=\"margin:0 0 14px;font-size:14px;font-weight:600;color:#fafafa;\">What happens if you do not renew?</h2>" #
    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-size:13px;line-height:21px;color:#a1a1aa;\"><tbody>" #
    "<tr><td width=\"24\" valign=\"top\" style=\"padding:0 0 14px;font-weight:600;color:#d4d4d8;\">1.</td><td style=\"padding:0 0 14px;\"><strong style=\"color:#e4e4e7;\">Days 1–7: Grace Period</strong><br>The bucket is marked as expired and uploads are disabled. Existing CDN files remain publicly accessible during this period.</td></tr>" #
    "<tr><td width=\"24\" valign=\"top\" style=\"padding:0 0 14px;font-weight:600;color:#d4d4d8;\">2.</td><td style=\"padding:0 0 14px;\"><strong style=\"color:#e4e4e7;\">Days 8–21: Frozen Period</strong><br>Public CDN access is suspended. Only the authenticated owner can access the bucket and renew the storage plan.</td></tr>" #
    "<tr><td width=\"24\" valign=\"top\" style=\"font-weight:600;color:#d4d4d8;\">3.</td><td><strong style=\"color:#e4e4e7;\">After Day 21: Tombstoned</strong><br>Unclaimed buckets are marked as tombstoned according to the storage lifecycle policy.</td></tr>" #
    "</tbody></table>" #
    "<p style=\"margin:24px 0 0;font-size:12px;line-height:20px;color:#a1a1aa;\">We recommend renewing before your current plan expires to minimize disruption to your applications and CDN delivery.</p>" #
    "</td></tr>" #
    "<tr><td style=\"padding:24px 32px;background-color:#09090b;border-top:1px solid #3f3f46;text-align:center;\">" #
    "<p style=\"margin:0 0 12px;font-size:12px;line-height:19px;color:#71717a;\">This automated notification was sent by the <strong style=\"color:#a1a1aa;\">icpay_notifier</strong> canister on the Internet Computer.</p>" #
    "<p style=\"margin:0;font-size:12px;line-height:20px;\"><a href=\"https://icpay.app/bucket\" style=\"color:#e4e4e7;text-decoration:underline;\">Dashboard</a><span style=\"color:#52525b;\"> &nbsp;|&nbsp; </span><a href=\"https://icpay.app/bucket/docs\" style=\"color:#a1a1aa;text-decoration:underline;\">Documentation</a><span style=\"color:#52525b;\"> &nbsp;|&nbsp; </span><a href=\"https://icpay.app\" style=\"color:#a1a1aa;text-decoration:underline;\">ICPay Home</a></p>" #
    "<p style=\"margin:16px 0 0;font-size:11px;line-height:18px;color:#52525b;\">Decentralized cloud storage built on the Internet Computer.</p>" #
    "</td></tr></tbody></table></td></tr></tbody></table>"
  };

  public func renderGracePeriod(
    bucketName: Text,
    bucketId: Text
  ) : Text {
    let renewUrl = "https://icpay.app/bucket/" # bucketId;

    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#09090b;padding:40px 16px;font-family:Arial,Helvetica,sans-serif;\"><tbody><tr><td align=\"center\">" #
    "<table role=\"presentation\" width=\"580\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;max-width:580px;background-color:#18181b;border:1px solid #ef4444;border-radius:12px;overflow:hidden;\"><tbody><tr>" #
    "<td style=\"padding:28px 32px;border-bottom:1px solid #3f3f46;\"><table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><tbody><tr>" #
    "<td align=\"left\"><span style=\"font-size:20px;font-weight:700;letter-spacing:-0.5px;color:#fafafa;\">ICPay</span> <span style=\"font-size:14px;color:#a1a1aa;font-weight:400;\">Cloud Storage</span></td>" #
    "<td align=\"right\"><span style=\"font-size:11px;font-weight:600;color:#ef4444;border:1px solid #ef4444;border-radius:6px;padding:5px 9px;\">PLAN EXPIRED</span></td>" #
    "</tr></tbody></table></td></tr>" #
    "<tr><td style=\"padding:32px;\">" #
    "<h1 style=\"margin:0 0 12px;font-size:24px;line-height:32px;font-weight:700;letter-spacing:-0.6px;color:#ef4444;\">Bucket is now in Read-Only Grace Period</h1>" #
    "<p style=\"margin:0 0 28px;font-size:14px;line-height:23px;color:#a1a1aa;\">Your ICPay Cloud Storage bucket <strong style=\"color:#fafafa;\">" # bucketName # "</strong> has expired. Uploads are currently paused. Your files remain accessible on CDN during this 7-day grace window.</p>" #
    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#09090b;border:1px solid #3f3f46;border-radius:8px;margin-bottom:24px;\"><tbody><tr><td style=\"padding:20px;\">" #
    "<p style=\"margin:0 0 18px;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:#a1a1aa;\">Storage Details</p>" #
    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><tbody>" #
    "<tr><td style=\"padding:0 12px 14px 0;font-size:13px;color:#a1a1aa;\">Bucket Name</td><td align=\"right\" style=\"padding-bottom:14px;font-size:13px;font-weight:600;color:#fafafa;word-break:break-word;\">" # bucketName # "</td></tr>" #
    "<tr><td style=\"padding:0 12px 14px 0;font-size:13px;color:#a1a1aa;\">Canister ID</td><td align=\"right\" style=\"padding-bottom:14px;font-size:12px;font-family:monospace;color:#d4d4d8;word-break:break-all;\">" # bucketId # "</td></tr>" #
    "<tr><td style=\"padding-right:12px;font-size:13px;color:#a1a1aa;\">Status</td><td align=\"right\" style=\"font-size:13px;font-weight:600;color:#ef4444;\">EXPIRED (Day 1–7 Grace)</td></tr>" #
    "</tbody></table></td></tr></tbody></table>" #
    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin-bottom:24px;\"><tbody><tr><td align=\"center\">" #
    "<a href=\"" # renewUrl # "\" style=\"display:inline-block;background-color:#ef4444;color:#ffffff;font-size:14px;font-weight:600;line-height:20px;text-decoration:none;padding:13px 28px;border-radius:7px;\">Restore Full Access · Renew Bucket →</a>" #
    "</td></tr></tbody></table>" #
    "<p style=\"margin:24px 0 0;font-size:12px;line-height:20px;color:#a1a1aa;\">If not renewed, the bucket will enter the frozen period on Day 8 where CDN public delivery is suspended.</p>" #
    "</td></tr>" #
    "<tr><td style=\"padding:24px 32px;background-color:#09090b;border-top:1px solid #3f3f46;text-align:center;\">" #
    "<p style=\"margin:0 0 12px;font-size:12px;line-height:19px;color:#71717a;\">This automated notification was sent by the <strong style=\"color:#a1a1aa;\">icpay_notifier</strong> canister on the Internet Computer.</p>" #
    "<p style=\"margin:0;font-size:12px;line-height:20px;\"><a href=\"https://icpay.app/bucket\" style=\"color:#e4e4e7;text-decoration:underline;\">Dashboard</a><span style=\"color:#52525b;\"> &nbsp;|&nbsp; </span><a href=\"https://icpay.app/bucket/docs\" style=\"color:#a1a1aa;text-decoration:underline;\">Documentation</a></p>" #
    "</td></tr></tbody></table></td></tr></tbody></table>"
  };
}
