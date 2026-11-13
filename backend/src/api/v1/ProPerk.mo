import Principal "mo:core/Principal";
import Types "../../types";
import ProPerkService "../../services/ProPerkService";
import MiddlewareAuth "../../middleware/Auth";

mixin (proPerks: ProPerkService.ProPerkService, mwConfig: MiddlewareAuth.Config) {
  public shared ({ caller }) func claim_pro_perk(): async Types.ApiResult<Bool> {
    let effective = MiddlewareAuth.effectiveCaller(mwConfig, caller);
    ProPerkService.claim(proPerks, effective);
  };

  public shared query ({ caller }) func has_claimed_pro_perk(): async Bool {
    let effective = MiddlewareAuth.effectiveCaller(mwConfig, caller);
    ProPerkService.hasClaimed(proPerks, effective);
  };

  public shared query ({ caller }) func admin_get_pro_perk_stats(): async Types.ApiResult<ProPerkService.AdminStats> {
    ProPerkService.adminGetStats(proPerks, caller);
  };

  public shared query ({ caller }) func admin_check_user_perk(target: Principal): async Types.ApiResult<ProPerkService.AdminUserCheck> {
    ProPerkService.adminCheckUser(proPerks, caller, target);
  };

  public shared ({ caller }) func admin_reset_user_perk(target: Principal): async Types.ApiResult<Bool> {
    ProPerkService.adminResetClaim(proPerks, caller, target);
  };
};
