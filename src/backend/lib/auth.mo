import AccessControl "mo:caffeineai-authorization/access-control";

module {
  // Returns true only when the caller is a registered admin.
  //
  // AccessControl.isAdmin delegates to getUserRole, which traps with
  // "User is not registered" for any principal that never registered. That
  // turns an authorization check into an opaque trap for unregistered and
  // anonymous callers. This helper treats an unregistered caller as a
  // non-admin instead, so admin endpoints reject them cleanly while a
  // registered admin still passes.
  public func isAdmin(
    state : AccessControl.AccessControlState,
    caller : Principal,
  ) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (state.userRoles.get(caller)) {
      case (?#admin) { true };
      case (_) { false };
    };
  };
};
