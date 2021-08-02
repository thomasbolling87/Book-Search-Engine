const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type User {
        _id: ID!
        username: String
        email: String
        password: String
        savedBooks: [Book]
    }

    type Book {
        _id: ID!
        authors: [String]
        description: String
        bookId: ID!
        image: String
        link: String
        title: String!
    }

    input SavedBooks {
        description: String
        title: String
        bookId: String
        image: String
        link: String
        authors: [String]
    }

    type Auth {
        token: ID!
        user: User
    }

    type Query {
        users: [User]
        user(username: String!): User
        books(username: String): [Book]
        book(bookId: ID!): Book
        me: User
    }

    type Mutation {
        addUser(username: String!, email: String!, password: String!): Auth
        login(email: String!, password: String!): Auth
        saveBook(authors: String!, description: String!, bookId: ID!, image: String!, link: String!, title: String!): User
        removeBook(bookId: ID!): User
    }
`;

module.exports = typeDefs;