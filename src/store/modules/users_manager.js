import usersService from "@/services/usersService";
import { parseManagedUserList, parseManagedUserShow } from "@/util/userApi";
import { isStaffAssignableRole } from "@/util/assignmentHelpers";

const state = {
  users: [],
  roles: [],
  selectOptions: [],
};

const getters = {
  getAdminUsers: (state) => state.users,
  getAssignableRoles: (state) => state.roles,
  getUsersForSelect: (state) => state.selectOptions,
};

const actions = {
  fetchUsers({ commit }) {
    return usersService.list().then((response) => {
      const { users, roles } = parseManagedUserList(response);
      commit("setUsers", users);
      commit("setRoles", roles);
      commit(
        "setSelectOptions",
        users
          .filter((user) => isStaffAssignableRole(user.roleName))
          .map((user) => ({
            id: user.id,
            full_name: user.fullName,
            name: user.name,
            last_name: user.lastName,
            email: user.email,
            role_name: user.roleName,
          }))
      );
      return { users, roles };
    });
  },
  fetchUserById(_, id) {
    return usersService
      .get(id)
      .then((response) => parseManagedUserShow(response));
  },
  createUser(_, payload) {
    return usersService.create(payload);
  },
  updateUser(_, { id, payload }) {
    return usersService.update(id, payload);
  },
  deleteUser({ commit, state }, id) {
    return usersService.remove(id).then((response) => {
      commit(
        "setUsers",
        state.users.filter((user) => String(user.id) !== String(id))
      );
      commit(
        "setSelectOptions",
        state.selectOptions.filter((user) => String(user.id) !== String(id))
      );
      return response;
    });
  },
  fetchUsersForSelect({ dispatch }) {
    return dispatch("fetchUsers");
  },
};

const mutations = {
  setUsers(state, users) {
    state.users = users;
  },
  setRoles(state, roles) {
    state.roles = roles;
  },
  setSelectOptions(state, options) {
    state.selectOptions = options;
  },
  clearUsers(state) {
    state.users = [];
    state.roles = [];
    state.selectOptions = [];
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
