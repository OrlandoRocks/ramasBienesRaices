import axios from "axios";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;

export default {
  namespaced: true,
  state: {
    presignedUrl: null,
    uploadPath: null,
  },
  mutations: {
    setPresignedUrl(state, { url, path }) {
      state.presignedUrl = url;
      state.uploadPath = path;
    },
  },
  actions: {
    getPresignedUrl({ commit }, fileName) {
      return new Promise((resolve, reject) => {
        const config = {
          headers: {
            Authorization: localStorage.getItem("auth_token"),
          },
        };
        return axios
          .post(
            `${BASE_URL}/s3_presigned_url`,
            {
              file_name: fileName,
            },
            config
          )
          .then((response) => {
            commit("setPresignedUrl", {
              url: response.data.url,
              path: response.data.path
            });
            resolve(response.data);
          }).catch((error) => {
            console.error(error);
            reject(error);
          });
      });
    },
    uploadFileToS3(_, { url, file }) {
      console.log("uploadFileToS3: ", file);
      const options = {
        headers: { "Content-Type": file.type },
      };
      return axios.put(url, file, options);
    },
  },
};
