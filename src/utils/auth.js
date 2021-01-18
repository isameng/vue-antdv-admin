import store from "@/store";

export function getCurrentAuthority() {
  const authority = store.state.permission.roleTags;
  return authority;
}

export function check(authority) {
  const current = getCurrentAuthority();
  return current.some(item => authority.includes(item));
}
