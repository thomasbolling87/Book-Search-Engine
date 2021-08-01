const { AuthenticationError } = require('apollo-server-express');
const { Book, User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, { username }) => {
            if (context.user) {
                const userData = await User.findOne({username})
                .select('password')
                .populate('books')
                return userData;
            }
            throw new AuthenticationError('You are not logged in')
        },
        users: async () => {
            return User.find().populate('books');
        },
        user: async (parent, { username }) => {
            return User.findOne( {username }).populate('books');
        },
        books: async (parent, { username }) => {
            const params = username ? { username } : {};
            return Book.find(params).username.sort({ savedBooks: -1 });
        },
        book: async (parent, { bookId }) => {
            return Book.findOne({ _id: bookId });
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
                await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $push: { saveBook: book } }
                );
                return book;
            }
            throw new AuthenticationError("You need to be logged in")
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const book = await Book.findOneAndDelete({
                    _id: bookId
                });

                await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } }
                );

                return book;
            }
            throw new AuthenticationError("You need to be logged in")
        }
    }
};

module.exports = resolvers;