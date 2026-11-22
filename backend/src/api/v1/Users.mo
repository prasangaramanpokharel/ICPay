import Types "../../types";
import UserService "../../services/UserService";
import MiddlewareAuth "../../middleware/Auth";

mixin (users: UserService.UserService, mwConfig: MiddlewareAuth.Config) {
  public shared query ({ caller }) func getUser() : async ?Types.UserPublic {
    UserService.getProfile(users, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };

  public shared query ({ caller }) func getUsernames() : async [Text] {
    UserService.getUsernames(users, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };

  public shared query ({ caller }) func getMyUsernames() : async [Text] {
    UserService.getUsernames(users, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };

  public shared ({ caller }) func updateUsername(newUsername: Text) : async Types.ApiResult<Types.UserPublic> {
    UserService.updateUsername(users, MiddlewareAuth.effectiveCaller(mwConfig, caller), newUsername);
  };

  public shared ({ caller }) func setPrimaryUsername(username: Text) : async Types.ApiResult<Types.UserPublic> {
    UserService.setPrimaryUsername(users, MiddlewareAuth.effectiveCaller(mwConfig, caller), username);
  };

  public shared query func checkUsername(name: Text) : async Bool {
    UserService.checkAvailability(users, name);
  };

  public shared query func searchUsers(searchText: Text) : async [Types.UserPublic] {
    UserService.search(users, searchText);
  };

  public shared query func resolveUsername(name: Text) : async ?Principal {
    UserService.resolveUsername(users, name);
  };

  public shared query func getUsernameCount() : async Nat {
    UserService.usernameCount(users);
  };
};
