import { gql } from '@apollo/client';

export const USERS_QUERY = gql`
  query getUsers(
    $pageNum: Int
    $perPage: Int
    $q: String
    $sort: String
    $order: String
  ) {
    users(
      pageNum: $pageNum
      perPage: $perPage
      q: $q
      sort: $sort
      order: $order
    ) {
      usersCount
      usersList {
        _id
        admin
        username
        createdAt
      }
    }
  }
`;

export const CURRENT_USER_QUERY = gql`
  query {
    currentUser {
      _id
      admin
      username
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation createUser(
    $username: String!
    $password: String!
    $admin: Boolean!
  ) {
    createUser(username: $username, password: $password, admin: $admin) {
      _id
      username
      admin
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation updateUser(
    $userId: String!
    $username: String!
    $password: String
    $admin: Boolean!
  ) {
    updateUser(
      userId: $userId
      username: $username
      password: $password
      admin: $admin
    ) {
      _id
      username
      admin
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation deleteUser($userId: String!) {
    deleteUser(userId: $userId)
  }
`;
