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

    "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">" #
    "<html xmlns=\"http://www.w3.org/1999/xhtml\" lang=\"en\">" #
    "<head>" #
    "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />" #
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />" #
    "<meta name=\"format-detection\" content=\"telephone=no\" />" #
    "<title>Action Required: Bucket Expiry Notice</title>" #
    "<style type=\"text/css\">" #
    "body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }" #
    "body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; }" #
    "a { color: #ad1470; text-decoration: underline; }" #
    "@media screen and (max-width: 600px) {" #
    ".email-container { width: 100% !important; padding: 12px !important; }" #
    ".content-cell { padding: 20px 12px !important; }" #
    ".heading-title { font-size: 23px !important; }" #
    ".heading-subtitle { font-size: 15px !important; }" #
    "}" #
    "</style>" #
    "</head>" #
    "<body style=\"margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;\">" #
    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#ffffff;margin:0;padding:24px 0 48px 0;width:100%;\">" #
    "<tr><td align=\"center\" style=\"padding:0 12px;\">" #
    "<table role=\"presentation\" class=\"email-container\" width=\"600\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;max-width:600px;background-color:#ffffff;border:none;margin:0 auto;\">" #
    "<tr><td align=\"center\" style=\"padding:24px 16px 20px 16px;text-align:center;\">" #
    "<table role=\"presentation\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin:0 auto;\">" #
    "<tr><td align=\"center\">" #
    "<a href=\"https://icpay.app/icbucket\" target=\"_blank\" style=\"text-decoration:none;display:inline-block;\">" #
    "<img src=\"https://resend-attachments.s3.amazonaws.com/s26CREBIp1ivhyo207NP1L/cdd937f1-1ebc-44c9-be41-639cd5fb79c0\" width=\"48\" height=\"48\" alt=\"Icpay\" style=\"display:block;width:48px;height:48px;margin:0 auto;border:0;outline:none;\" />" #
    "</a></td></tr>" #
    "<tr><td align=\"center\" style=\"padding-top:12px;\">" #
    "<div class=\"heading-title\" style=\"margin:0 0 4px 0;font-size:25px;line-height:144%;font-weight:700;color:#ad1470;letter-spacing:1px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;\">Icpay</div>" #
    "<div class=\"heading-subtitle\" style=\"margin:0;font-size:17px;line-height:144%;font-weight:400;color:#433c3c;letter-spacing:1px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;\">The on-chain storage &amp; wallet</div>" #
    "</td></tr></table></td></tr>" #
    "<tr><td style=\"padding:4px 16px 12px 16px;\">" #
    "<div style=\"border-top:1px solid #f1f5f9;line-height:1px;font-size:1px;\">&nbsp;</div>" #
    "</td></tr>" #
    "<tr><td class=\"content-cell\" style=\"padding:16px 16px 24px 16px;font-size:15px;line-height:25px;color:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;\">" #
    "<p style=\"margin:0 0 18px 0;font-size:15px;line-height:25px;color:#111827;\">Hi there,</p>" #
    "<p style=\"margin:0 0 18px 0;font-size:15px;line-height:25px;color:#111827;\">" #
    "Your ICPay Cloud Storage bucket <strong>" # bucketName # "</strong> has <strong>" # daysStr # " day(s)</strong> remaining on its current storage lease." #
    "</p>" #
    "<p style=\"margin:0 0 18px 0;font-size:15px;line-height:25px;color:#111827;\">" #
    "To ensure uninterrupted public CDN delivery (<a href=\"https://cloud.icpay.app\" target=\"_blank\" style=\"color:#ad1470;text-decoration:none;font-weight:500;\">cloud.icpay.app</a>) and avoid your bucket entering the read-only grace period, please renew your storage plan." #
    "</p>" #
    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin:20px 0 24px 0;background-color:#fafafa;border:1px solid #f1f5f9;border-radius:8px;overflow:hidden;\">" #
    "<tr><td style=\"padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;\">Bucket Name</td>" #
    "<td align=\"right\" style=\"padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#111827;word-break:break-word;\">" # bucketName # "</td></tr>" #
    "<tr><td style=\"padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;\">Canister ID</td>" #
    "<td align=\"right\" style=\"padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;color:#111827;word-break:break-all;\">" # bucketId # "</td></tr>" #
    "<tr><td style=\"padding:12px 16px;font-size:14px;color:#64748b;\">Time Remaining</td>" #
    "<td align=\"right\" style=\"padding:12px 16px;font-size:14px;font-weight:700;color:#ad1470;\">" # daysStr # " day(s)</td></tr>" #
    "</table>" #
    "<table role=\"presentation\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin:24px 0 28px 0;width:100%;\">" #
    "<tr><td align=\"center\">" #
    "<a href=\"" # renewUrl # "\" target=\"_blank\" style=\"background-color:#ff0063;background-image:url('https://res.cloudinary.com/dn2ycbmrc/image/upload/v1792912137/btnbg_sfuhzk.png');background-size:cover;background-position:center;color:#ffffff;display:block;width:100%;box-sizing:border-box;text-align:center;padding:14px 24px;font-size:15px;font-weight:700;text-decoration:none;border-radius:28px;letter-spacing:0.4px;line-height:20px;box-shadow:0 4px 14px rgba(255,0,99,0.28);text-shadow:0 1px 2px rgba(0,0,0,0.25);\">" #
    "Renew Storage Plan &rarr;" #
    "</a></td></tr></table>" #
    "<p style=\"margin:0 0 14px 0;font-size:14px;line-height:23px;color:#111827;\"><strong>What happens if your plan expires?</strong></p>" #
    "<ul style=\"margin:0 0 22px 0;padding-left:20px;font-size:14px;line-height:23px;color:#4b5563;\">" #
    "<li style=\"margin-bottom:6px;\"><strong>Days 1–7 (Grace Period):</strong> Uploads and file edits are paused. Existing files stay live on CDN.</li>" #
    "<li style=\"margin-bottom:6px;\"><strong>Days 8–21 (Frozen Period):</strong> Public CDN access is suspended. Only the authenticated owner can access and renew.</li>" #
    "<li><strong>After Day 21 (Tombstoned):</strong> Unclaimed storage is permanently reclaimed.</li>" #
    "</ul>" #
    "<p style=\"margin:0 0 20px 0;font-size:14px;line-height:23px;color:#4b5563;\">" #
    "Choosing the 365-day annual plan adds <strong>2 complimentary months</strong> at no additional cost. Renewing preserves all permanent file URLs and S3 API credentials seamlessly." #
    "</p>" #
    "<table role=\"presentation\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin-top:20px;\">" #
    "<tr><td style=\"font-size:15px;line-height:24px;color:#111827;\">" #
    "Best regards,<br /><br />" #
    "<strong style=\"color:#111827;font-weight:700;\">Raman Pokharel</strong><br />" #
    "<span style=\"color:#4b5563;\">Founder, <a href=\"https://icpay.app\" target=\"_blank\" style=\"color:#ad1470;text-decoration:none;font-weight:600;\">ICPay</a></span>" #
    "</td></tr></table></td></tr>" #
    "<tr><td style=\"padding:28px 16px 20px 16px;border-top:1px solid #f1f5f9;text-align:center;\">" #
    "<table role=\"presentation\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin:0 auto 16px auto;\"><tr>" #
    "<td align=\"center\" style=\"padding:0 8px;\"><a href=\"https://x.com/IcpayOfficial\" target=\"_blank\" title=\"Official Twitter\" style=\"text-decoration:none;display:inline-block;\"><img src=\"https://www.svgrepo.com/show/452123/twitter.svg\" width=\"18\" height=\"18\" alt=\"X (Twitter)\" style=\"display:block;width:18px;height:18px;opacity:0.75;\" /></a></td>" #
    "<td align=\"center\" style=\"padding:0 8px;\"><a href=\"https://www.linkedin.com/company/icpay\" target=\"_blank\" title=\"LinkedIn\" style=\"text-decoration:none;display:inline-block;\"><img src=\"https://www.svgrepo.com/show/54425/linkedin.svg\" width=\"18\" height=\"18\" alt=\"LinkedIn\" style=\"display:block;width:18px;height:18px;opacity:0.75;\" /></a></td>" #
    "<td align=\"center\" style=\"padding:0 8px;\"><a href=\"mailto:contact@icpay.cloud\" target=\"_blank\" title=\"Email\" style=\"text-decoration:none;display:inline-block;\"><img src=\"https://www.svgrepo.com/show/349378/gmail.svg\" width=\"18\" height=\"18\" alt=\"Email\" style=\"display:block;width:18px;height:18px;opacity:0.75;\" /></a></td>" #
    "</tr></table>" #
    "<p style=\"margin:0 0 10px 0;font-size:12px;line-height:18px;color:#64748b;\">" #
    "<a href=\"https://icpay.app/bucket/docs\" target=\"_blank\" style=\"color:#64748b;text-decoration:none;margin:0 6px;\">Documentation</a> &bull; " #
    "<a href=\"https://gitlab.com/prasangapokharel/icbucket\" target=\"_blank\" style=\"color:#64748b;text-decoration:none;margin:0 6px;\">GitLab SDK</a> &bull; " #
    "<a href=\"https://icpay.app/transparency\" target=\"_blank\" style=\"color:#64748b;text-decoration:none;margin:0 6px;\">Transparency</a> &bull; " #
    "<a href=\"mailto:contact@icpay.cloud\" style=\"color:#64748b;text-decoration:none;margin:0 6px;\">contact@icpay.cloud</a>" #
    "</p>" #
    "<p style=\"margin:0;font-size:11px;line-height:16px;color:#94a3b8;\">" #
    "&copy; 2026 ICPay Protocol &bull; Autonomous On-Chain Financial &amp; Object Storage Infrastructure" #
    "</p></td></tr></table></td></tr></table></body></html>"
  };

  public func renderGracePeriod(
    bucketName: Text,
    bucketId: Text
  ) : Text {
    let renewUrl = "https://icpay.app/bucket/" # bucketId;

    "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">" #
    "<html xmlns=\"http://www.w3.org/1999/xhtml\" lang=\"en\">" #
    "<head>" #
    "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />" #
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />" #
    "<meta name=\"format-detection\" content=\"telephone=no\" />" #
    "<title>Urgent: Bucket Grace Period Notice</title>" #
    "<style type=\"text/css\">" #
    "body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }" #
    "body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; }" #
    "a { color: #ad1470; text-decoration: underline; }" #
    "@media screen and (max-width: 600px) {" #
    ".email-container { width: 100% !important; padding: 12px !important; }" #
    ".content-cell { padding: 20px 12px !important; }" #
    ".heading-title { font-size: 23px !important; }" #
    ".heading-subtitle { font-size: 15px !important; }" #
    "}" #
    "</style>" #
    "</head>" #
    "<body style=\"margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;\">" #
    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#ffffff;margin:0;padding:24px 0 48px 0;width:100%;\">" #
    "<tr><td align=\"center\" style=\"padding:0 12px;\">" #
    "<table role=\"presentation\" class=\"email-container\" width=\"600\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;max-width:600px;background-color:#ffffff;border:none;margin:0 auto;\">" #
    "<tr><td align=\"center\" style=\"padding:24px 16px 20px 16px;text-align:center;\">" #
    "<table role=\"presentation\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin:0 auto;\">" #
    "<tr><td align=\"center\">" #
    "<a href=\"https://icpay.app/icbucket\" target=\"_blank\" style=\"text-decoration:none;display:inline-block;\">" #
    "<img src=\"https://resend-attachments.s3.amazonaws.com/s26CREBIp1ivhyo207NP1L/cdd937f1-1ebc-44c9-be41-639cd5fb79c0\" width=\"48\" height=\"48\" alt=\"Icpay\" style=\"display:block;width:48px;height:48px;margin:0 auto;border:0;outline:none;\" />" #
    "</a></td></tr>" #
    "<tr><td align=\"center\" style=\"padding-top:12px;\">" #
    "<div class=\"heading-title\" style=\"margin:0 0 4px 0;font-size:25px;line-height:144%;font-weight:700;color:#ad1470;letter-spacing:1px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;\">Icpay</div>" #
    "<div class=\"heading-subtitle\" style=\"margin:0;font-size:17px;line-height:144%;font-weight:400;color:#433c3c;letter-spacing:1px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;\">The on-chain storage &amp; wallet</div>" #
    "</td></tr></table></td></tr>" #
    "<tr><td style=\"padding:4px 16px 12px 16px;\">" #
    "<div style=\"border-top:1px solid #f1f5f9;line-height:1px;font-size:1px;\">&nbsp;</div>" #
    "</td></tr>" #
    "<tr><td class=\"content-cell\" style=\"padding:16px 16px 24px 16px;font-size:15px;line-height:25px;color:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;\">" #
    "<p style=\"margin:0 0 18px 0;font-size:15px;line-height:25px;color:#111827;\">Hi there,</p>" #
    "<p style=\"margin:0 0 18px 0;font-size:15px;line-height:25px;color:#111827;\">" #
    "The storage lease for bucket <strong>" # bucketName # "</strong> has expired and has entered the <strong>7-day read-only grace period</strong>." #
    "</p>" #
    "<p style=\"margin:0 0 18px 0;font-size:15px;line-height:25px;color:#111827;\">" #
    "Public CDN delivery (<a href=\"https://cloud.icpay.app\" target=\"_blank\" style=\"color:#ad1470;text-decoration:none;font-weight:500;\">cloud.icpay.app</a>) remains active so your live client applications and media links continue working, but new file uploads and modifications are temporarily suspended." #
    "</p>" #
    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin:20px 0 24px 0;background-color:#fafafa;border:1px solid #f1f5f9;border-radius:8px;overflow:hidden;\">" #
    "<tr><td style=\"padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;\">Bucket Name</td>" #
    "<td align=\"right\" style=\"padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#111827;word-break:break-word;\">" # bucketName # "</td></tr>" #
    "<tr><td style=\"padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;\">Canister ID</td>" #
    "<td align=\"right\" style=\"padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;color:#111827;word-break:break-all;\">" # bucketId # "</td></tr>" #
    "<tr><td style=\"padding:12px 16px;font-size:14px;color:#64748b;\">Current Status</td>" #
    "<td align=\"right\" style=\"padding:12px 16px;font-size:14px;font-weight:700;color:#b91c1c;\">EXPIRED (Grace Period)</td></tr>" #
    "</table>" #
    "<table role=\"presentation\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin:24px 0 28px 0;width:100%;\">" #
    "<tr><td align=\"center\">" #
    "<a href=\"" # renewUrl # "\" target=\"_blank\" style=\"background-color:#ff0063;background-image:url('https://res.cloudinary.com/dn2ycbmrc/image/upload/v1792912137/btnbg_sfuhzk.png');background-size:cover;background-position:center;color:#ffffff;display:block;width:100%;box-sizing:border-box;text-align:center;padding:14px 24px;font-size:15px;font-weight:700;text-decoration:none;border-radius:28px;letter-spacing:0.4px;line-height:20px;box-shadow:0 4px 14px rgba(255,0,99,0.28);text-shadow:0 1px 2px rgba(0,0,0,0.25);\">" #
    "Restore Full Access &bull; Renew Bucket &rarr;" #
    "</a></td></tr></table>" #
    "<p style=\"margin:0 0 14px 0;font-size:14px;line-height:23px;color:#111827;\"><strong>Lifecycle Policy Next Steps:</strong></p>" #
    "<ul style=\"margin:0 0 22px 0;padding-left:20px;font-size:14px;line-height:23px;color:#4b5563;\">" #
    "<li style=\"margin-bottom:6px;\"><strong>Days 1–7 (Grace Period):</strong> Public CDN remains online. Uploads paused.</li>" #
    "<li style=\"margin-bottom:6px;\"><strong>Days 8–21 (Frozen Period):</strong> Public CDN is disabled. Only the authenticated owner can access and renew.</li>" #
    "<li><strong>After Day 21 (Tombstoned):</strong> Storage space is reclaimed permanently.</li>" #
    "</ul>" #
    "<p style=\"margin:0 0 20px 0;font-size:14px;line-height:23px;color:#4b5563;\">" #
    "Renewing immediately restores full write operations without altering any file paths, hashes, DNS configurations, or existing S3 credentials." #
    "</p>" #
    "<table role=\"presentation\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin-top:20px;\">" #
    "<tr><td style=\"font-size:15px;line-height:24px;color:#111827;\">" #
    "Best regards,<br /><br />" #
    "<strong style=\"color:#111827;font-weight:700;\">Raman Pokharel</strong><br />" #
    "<span style=\"color:#4b5563;\">Founder, <a href=\"https://icpay.app\" target=\"_blank\" style=\"color:#ad1470;text-decoration:none;font-weight:600;\">ICPay</a></span>" #
    "</td></tr></table></td></tr>" #
    "<tr><td style=\"padding:28px 16px 20px 16px;border-top:1px solid #f1f5f9;text-align:center;\">" #
    "<table role=\"presentation\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin:0 auto 16px auto;\"><tr>" #
    "<td align=\"center\" style=\"padding:0 8px;\"><a href=\"https://x.com/IcpayOfficial\" target=\"_blank\" title=\"Official Twitter\" style=\"text-decoration:none;display:inline-block;\"><img src=\"https://www.svgrepo.com/show/452123/twitter.svg\" width=\"18\" height=\"18\" alt=\"X (Twitter)\" style=\"display:block;width:18px;height:18px;opacity:0.75;\" /></a></td>" #
    "<td align=\"center\" style=\"padding:0 8px;\"><a href=\"https://www.linkedin.com/company/icpay\" target=\"_blank\" title=\"LinkedIn\" style=\"text-decoration:none;display:inline-block;\"><img src=\"https://www.svgrepo.com/show/54425/linkedin.svg\" width=\"18\" height=\"18\" alt=\"LinkedIn\" style=\"display:block;width:18px;height:18px;opacity:0.75;\" /></a></td>" #
    "<td align=\"center\" style=\"padding:0 8px;\"><a href=\"mailto:contact@icpay.cloud\" target=\"_blank\" title=\"Email\" style=\"text-decoration:none;display:inline-block;\"><img src=\"https://www.svgrepo.com/show/349378/gmail.svg\" width=\"18\" height=\"18\" alt=\"Email\" style=\"display:block;width:18px;height:18px;opacity:0.75;\" /></a></td>" #
    "</tr></table>" #
    "<p style=\"margin:0 0 10px 0;font-size:12px;line-height:18px;color:#64748b;\">" #
    "<a href=\"https://icpay.app/bucket/docs\" target=\"_blank\" style=\"color:#64748b;text-decoration:none;margin:0 6px;\">Documentation</a> &bull; " #
    "<a href=\"https://gitlab.com/prasangapokharel/icbucket\" target=\"_blank\" style=\"color:#64748b;text-decoration:none;margin:0 6px;\">GitLab SDK</a> &bull; " #
    "<a href=\"https://icpay.app/transparency\" target=\"_blank\" style=\"color:#64748b;text-decoration:none;margin:0 6px;\">Transparency</a> &bull; " #
    "<a href=\"mailto:contact@icpay.cloud\" style=\"color:#64748b;text-decoration:none;margin:0 6px;\">contact@icpay.cloud</a>" #
    "</p>" #
    "<p style=\"margin:0;font-size:11px;line-height:16px;color:#94a3b8;\">" #
    "&copy; 2026 ICPay Protocol &bull; Autonomous On-Chain Financial &amp; Object Storage Infrastructure" #
    "</p></td></tr></table></td></tr></table></body></html>"
  };

  public func renderBucketCreated(
    bucketName: Text,
    bucketId: Text,
    capacityGB: Nat
  ) : Text {
    let capStr = Nat.toText(capacityGB);
    let dashboardUrl = "https://icpay.app/bucket?id=" # bucketId;

    "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">" #
    "<html xmlns=\"http://www.w3.org/1999/xhtml\" lang=\"en\">" #
    "<head>" #
    "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />" #
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />" #
    "<meta name=\"format-detection\" content=\"telephone=no\" />" #
    "<title>ICPay Bucket Activated</title>" #
    "<style type=\"text/css\">" #
    "body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }" #
    "body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; }" #
    "a { color: #ad1470; text-decoration: underline; }" #
    "@media screen and (max-width: 600px) {" #
    ".email-container { width: 100% !important; padding: 12px !important; }" #
    ".content-cell { padding: 20px 12px !important; }" #
    ".heading-title { font-size: 23px !important; }" #
    ".heading-subtitle { font-size: 15px !important; }" #
    "}" #
    "</style>" #
    "</head>" #
    "<body style=\"margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;\">" #
    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#ffffff;margin:0;padding:24px 0 48px 0;width:100%;\">" #
    "<tr><td align=\"center\" style=\"padding:0 12px;\">" #
    "<table role=\"presentation\" class=\"email-container\" width=\"600\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;max-width:600px;background-color:#ffffff;border:none;margin:0 auto;\">" #
    "<tr><td align=\"center\" style=\"padding:24px 16px 20px 16px;text-align:center;\">" #
    "<table role=\"presentation\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin:0 auto;\">" #
    "<tr><td align=\"center\">" #
    "<a href=\"https://icpay.app/icbucket\" target=\"_blank\" style=\"text-decoration:none;display:inline-block;\">" #
    "<img src=\"https://resend-attachments.s3.amazonaws.com/s26CREBIp1ivhyo207NP1L/cdd937f1-1ebc-44c9-be41-639cd5fb79c0\" width=\"48\" height=\"48\" alt=\"Icpay\" style=\"display:block;width:48px;height:48px;margin:0 auto;border:0;outline:none;\" />" #
    "</a></td></tr>" #
    "<tr><td align=\"center\" style=\"padding-top:12px;\">" #
    "<div class=\"heading-title\" style=\"margin:0 0 4px 0;font-size:25px;line-height:144%;font-weight:700;color:#ad1470;letter-spacing:1px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;\">Icpay</div>" #
    "<div class=\"heading-subtitle\" style=\"margin:0;font-size:17px;line-height:144%;font-weight:400;color:#433c3c;letter-spacing:1px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;\">The on-chain storage &amp; wallet</div>" #
    "</td></tr></table></td></tr>" #
    "<tr><td style=\"padding:4px 16px 12px 16px;\">" #
    "<div style=\"border-top:1px solid #f1f5f9;line-height:1px;font-size:1px;\">&nbsp;</div>" #
    "</td></tr>" #
    "<tr><td class=\"content-cell\" style=\"padding:16px 16px 24px 16px;font-size:15px;line-height:25px;color:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;\">" #
    "<p style=\"margin:0 0 18px 0;font-size:15px;line-height:25px;color:#111827;\">Hi there,</p>" #
    "<p style=\"margin:0 0 18px 0;font-size:15px;line-height:25px;color:#111827;\">" #
    "Your new on-chain storage bucket <strong>" # bucketName # "</strong> has been provisioned and is ready for use on the Internet Computer." #
    "</p>" #
    "<p style=\"margin:0 0 18px 0;font-size:15px;line-height:25px;color:#111827;\">" #
    "You can now upload files through the dashboard, generate scoped API keys (<code style=\"background-color:#f1f5f9;color:#0f172a;padding:2px 6px;border-radius:4px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;\">icp_cloud_*</code>), or connect standard S3 SDKs with zero egress bandwidth fees." #
    "</p>" #
    "<table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin:20px 0 24px 0;background-color:#fafafa;border:1px solid #f1f5f9;border-radius:8px;overflow:hidden;\">" #
    "<tr><td style=\"padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;\">Bucket Name</td>" #
    "<td align=\"right\" style=\"padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#111827;word-break:break-word;\">" # bucketName # "</td></tr>" #
    "<tr><td style=\"padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;\">Canister ID</td>" #
    "<td align=\"right\" style=\"padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;color:#111827;word-break:break-all;\">" # bucketId # "</td></tr>" #
    "<tr><td style=\"padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;\">Storage Capacity</td>" #
    "<td align=\"right\" style=\"padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#111827;\">" # capStr # " GB</td></tr>" #
    "<tr><td style=\"padding:12px 16px;font-size:14px;color:#64748b;\">Status</td>" #
    "<td align=\"right\" style=\"padding:12px 16px;font-size:14px;font-weight:700;color:#059669;\">ACTIVE</td></tr>" #
    "</table>" #
    "<table role=\"presentation\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin:24px 0 28px 0;width:100%;\">" #
    "<tr><td align=\"center\">" #
    "<a href=\"" # dashboardUrl # "\" target=\"_blank\" style=\"background-color:#ff0063;background-image:url('https://res.cloudinary.com/dn2ycbmrc/image/upload/v1792912137/btnbg_sfuhzk.png');background-size:cover;background-position:center;color:#ffffff;display:block;width:100%;box-sizing:border-box;text-align:center;padding:14px 24px;font-size:15px;font-weight:700;text-decoration:none;border-radius:28px;letter-spacing:0.4px;line-height:20px;box-shadow:0 4px 14px rgba(255,0,99,0.28);text-shadow:0 1px 2px rgba(0,0,0,0.25);\">" #
    "Open Bucket Dashboard &rarr;" #
    "</a></td></tr></table>" #
    "<p style=\"margin:0 0 14px 0;font-size:14px;line-height:23px;color:#111827;\"><strong>Drop-In AWS S3 SDK Support:</strong></p>" #
    "<p style=\"margin:0 0 22px 0;font-size:14px;line-height:23px;color:#4b5563;\">" #
    "Point your existing <code style=\"background-color:#f1f5f9;color:#0f172a;padding:2px 6px;border-radius:4px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;\">@aws-sdk/client-s3</code>, <code style=\"background-color:#f1f5f9;color:#0f172a;padding:2px 6px;border-radius:4px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;\">MinIO</code>, or <code style=\"background-color:#f1f5f9;color:#0f172a;padding:2px 6px;border-radius:4px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;\">boto3</code> client to <code style=\"background-color:#f1f5f9;color:#0f172a;padding:2px 6px;border-radius:4px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;\">https://cloud.icpay.app</code>. All assets cached globally at <a href=\"https://cloud.icpay.app\" target=\"_blank\" style=\"color:#ad1470;text-decoration:none;font-weight:500;\">cloud.icpay.app</a> incur $0.00 in egress bandwidth penalties." #
    "</p>" #
    "<table role=\"presentation\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin-top:20px;\">" #
    "<tr><td style=\"font-size:15px;line-height:24px;color:#111827;\">" #
    "Best regards,<br /><br />" #
    "<strong style=\"color:#111827;font-weight:700;\">Raman Pokharel</strong><br />" #
    "<span style=\"color:#4b5563;\">Founder, <a href=\"https://icpay.app\" target=\"_blank\" style=\"color:#ad1470;text-decoration:none;font-weight:600;\">ICPay</a></span>" #
    "</td></tr></table></td></tr>" #
    "<tr><td style=\"padding:28px 16px 20px 16px;border-top:1px solid #f1f5f9;text-align:center;\">" #
    "<table role=\"presentation\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin:0 auto 16px auto;\"><tr>" #
    "<td align=\"center\" style=\"padding:0 8px;\"><a href=\"https://x.com/IcpayOfficial\" target=\"_blank\" title=\"Official Twitter\" style=\"text-decoration:none;display:inline-block;\"><img src=\"https://www.svgrepo.com/show/452123/twitter.svg\" width=\"18\" height=\"18\" alt=\"X (Twitter)\" style=\"display:block;width:18px;height:18px;opacity:0.75;\" /></a></td>" #
    "<td align=\"center\" style=\"padding:0 8px;\"><a href=\"https://www.linkedin.com/company/icpay\" target=\"_blank\" title=\"LinkedIn\" style=\"text-decoration:none;display:inline-block;\"><img src=\"https://www.svgrepo.com/show/54425/linkedin.svg\" width=\"18\" height=\"18\" alt=\"LinkedIn\" style=\"display:block;width:18px;height:18px;opacity:0.75;\" /></a></td>" #
    "<td align=\"center\" style=\"padding:0 8px;\"><a href=\"mailto:contact@icpay.cloud\" target=\"_blank\" title=\"Email\" style=\"text-decoration:none;display:inline-block;\"><img src=\"https://www.svgrepo.com/show/349378/gmail.svg\" width=\"18\" height=\"18\" alt=\"Email\" style=\"display:block;width:18px;height:18px;opacity:0.75;\" /></a></td>" #
    "</tr></table>" #
    "<p style=\"margin:0 0 10px 0;font-size:12px;line-height:18px;color:#64748b;\">" #
    "<a href=\"https://icpay.app/bucket/docs\" target=\"_blank\" style=\"color:#64748b;text-decoration:none;margin:0 6px;\">Documentation</a> &bull; " #
    "<a href=\"https://gitlab.com/prasangapokharel/icbucket\" target=\"_blank\" style=\"color:#64748b;text-decoration:none;margin:0 6px;\">GitLab SDK</a> &bull; " #
    "<a href=\"https://icpay.app/transparency\" target=\"_blank\" style=\"color:#64748b;text-decoration:none;margin:0 6px;\">Transparency</a> &bull; " #
    "<a href=\"mailto:contact@icpay.cloud\" style=\"color:#64748b;text-decoration:none;margin:0 6px;\">contact@icpay.cloud</a>" #
    "</p>" #
    "<p style=\"margin:0;font-size:11px;line-height:16px;color:#94a3b8;\">" #
    "&copy; 2026 ICPay Protocol &bull; Autonomous On-Chain Financial &amp; Object Storage Infrastructure" #
    "</p></td></tr></table></td></tr></table></body></html>"
  };
};
