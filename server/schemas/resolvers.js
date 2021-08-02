const { AuthenticationError } = require('apollo-server-express');
const { Book, User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id }).populate('savedBooks');
            }
            throw new AuthenticationError('Cannot find user with that ID')
        }
    },
    Mutation: {
        addUser: async (parent, { username, email, password}) => {
            const user = await User.create({ username, email, password});
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError("There is no user with by email address");
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError("Incorrect password, please enter correct password");
            }

            const token = signToken(user);

            return { token, user };
        },
        saveBook: async (parent, { input }, context) => {
            const book = { ...input }
            if (context.user) {
                await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: book } }
                );
                return book;
            }
            throw new AuthenticationError("You need to be logged in")
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                return User.findByIdAndUpdate(
                    { _id: bookId },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
            }
            throw new AuthenticationError("You need to be logged in")
        }
    }
};

module.exports = resolvers;