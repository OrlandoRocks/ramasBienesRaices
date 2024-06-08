import axios from "axios";
import router from "@/router/router";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;

const state = {
  expenses: [],
  expense: {
    id: "",
    residential_id: "",
    user_id: "",
    account: "",
    department: "",
    expense_type: "",
    comments: "",
    amount: "",
    user_name: "",
    residential_name: "",
  },
};

const getters = {
  getExpenses(state) {
    return state.expenses;
  },
  getExpenseById(state) {
    return state.expense;
  },
};

const actions = {
  fetchExpenses({ commit }) {
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    axios
      .get(`${BASE_URL}/expenses`, config)
      .then((response) => {
        const formatedExpenses = response.data.map((expense) => {
          return {
            id: expense.id,
            residential_id: expense.residential_id,
            account: expense.account,
            user_id: expense.user_id,
            user_name: expense.user_full_name,
            residential_name: expense.residential_name,
            department: expense.department,
            comments: expense.comments,
            amount: expense.amount,
            expense_type: expense.expense_type,
          };
        });
        commit("setExpenses", formatedExpenses);
      })
      .catch((error) => {
        console.error(error);
      });
  },
  fetchExpenseById({ commit }, id) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .get(`${BASE_URL}/expenses/${id}`, config)
        .then((response) => {
          const formatedExpense = {
            id: response.data.id,
            residential_id: response.data.residential_id,
            account: response.data.account,
            user_id: response.data.user_id,
            user_name: response.data.user_full_name,
            residential_name: response.data.residential_name,
            department: response.data.department,
            comments: response.data.comments,
            amount: response.data.amount,
            expense_type: response.data.expense_type,
          };
          commit("setExpense", formatedExpense);
          resolve(formatedExpense);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  // eslint-disable-next-line no-empty-pattern
  createExpense({}, payload) {
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    return new Promise((resolve, reject) => {
      axios
        .post(`${BASE_URL}/expenses`, payload, config)
        .then((response) => {
          state.expenses.push(response.data);
          router.push("/expenses");
          resolve(response);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  updateExpense({ commit }, payload) {
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    return new Promise((resolve, reject) => {
      axios
        .put(`${BASE_URL}/expenses/${payload.expense.id}`, payload, config)
        .then((response) => {
          commit("setExpensesUpdate", response.data);
          router.push("/expenses");
          resolve(response);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  deleteExpense({ commit }, id) {
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    return new Promise((resolve, reject) => {
      axios
        .delete(`${BASE_URL}/expenses/${id}`, config)
        .then((response) => {
          commit("deleteExpense", id);
          resolve(response);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
};

const mutations = {
  setExpenses(state, expenses) {
    state.expenses = expenses;
  },
  setExpense(state, expense) {
    state.expense = expense;
  },
  setExpensesUpdate(state, expense) {
    const index = state.expenses.findIndex(
      (element) => element.id === expense.id
    );
    if (index !== -1) {
      state.expenses.splice(index, 1, expense);
    }
  },
  deleteExpense(state, id) {
    const index = state.expenses.findIndex((element) => element.id === id);
    if (index !== -1) {
      state.expenses.splice(index, 1);
    }
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
