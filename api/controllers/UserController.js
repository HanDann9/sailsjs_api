'use strict';
/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const jwToken = require('../services/jwToken');

module.exports = {
  /**
   * @api {GET} /users Users information
   * @apiName GetUsers
   * @apiGroup User
   * 
   * @apiHeader {String} token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.._k-1QIcbqaI6uU2OIaKPFCsVjV72sk8HhFMnsxrOPzE
   * 
   * @apiSuccess {String} id The users id.
   * @apiSuccess {String} email The users email.
   * @apiSuccess {String} name The users name.
   * 
   * @apiSuccessExample Success-Response
   *  HTTP/1.1 200 OK
   * {
      {
        "id": "624b9e34d2bae24d1885fdff",
        "email": "dan",
        "name": "Dan Han"
      },
      {
        "id": "624baad108f0ea0de8b1cfa0",
        "email": "han",
        "name": "Dan Han"
      },
      {
        "id": "624baad608f0ea0de8b1cfa1",
        "email": "han dan",
        "name": "Dan Han"
      }
   * }
   * 
   * @apiErrorExample Error-Response:
   *  HTTP/1.1 404 Not Found
   * {
   *  "error": "UserNotFound"
   * }
   */
  list: async (res) => {
    const users = await Users.find();

    res.send(
      users.map((user) => {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      })
    );
  },

  /**
   * @api {POST} /users/register Create user
   * @apiName CreateUser
   * @apiGroup User
   *
   * @apiBody {String} name Optional name of the User
   * @apiBody {String} password required password
   * @apiBody {String} confirmPassword required confirmPassword
   * @apiBody {String} email unique email
   *
   * @apiSuccess {String} id the user id has just been created
   * @apiSuccess {String} name the user name
   * @apiSuccess {String} email the user email
   * @apiSuccess {String} password the user password
   * @apiSuccess {String} accessToken AccessToken
   * @apiSuccess {String} refreshToken RefreshToken
   *
   * @apiSuccessExample Success-Response
   *  HTTP/1.1 200 OK
   * {
      "user": {
              "id": "624baad608f0ea0de8b1cfa1",
              "email": "han dan",
              "password": "$2b$10$DtC1dO/1DFyuR/4zg/RmcuaRxjhgsMnysLVqSAfdPjVlZ3/uJ2vK.",
              "name": "Dan Han"
              "createdAt": 1649126102496,
              "updatedAt": 1649126102496,
        },
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.._k-1QIcbqaI6uU2OIaKPFCsVjV72sk8HhFMnsxrOPzE",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..gBE79T7CWS1RF6jn1rwvMjqeaUIALZv0dvEhiAbw52Q"
   * }
   *
   * @apiErrorExample Error-Response      
   *  HTTP/1.1 500 Internal Server Error
   * {
   *  "error": "Something went wrong"
   * }
   */
  create: (req, res) => {
    const data = req.body;

    if (data.password !== data.confirmPassword) {
      return res.badRequest('Password not the same');
    }
    Users.create({
      email: data.email,
      password: data.password,
      name: data.name,
    })
      .fetch()
      .then((user) => {
        const accessToken = jwToken.sign(
          { id: user.id, name: user.name },
          1000 * 60 * 15
        );
        const refreshToken = jwToken.sign(
          { id: user.id, name: user.name },
          1000 * 60 * 60 * 12
        );
        res.send({
          user,
          accessToken: accessToken,
          refreshToken: refreshToken,
        });
      })
      .catch((err) => {
        sails.log.error(err);
        return res.serverError('Something went wrong');
      });
  },

  /**
   * @api {POST} /users/login Login User
   * @apiName LoginUser
   * @apiGroup User
   *
   * @apiBody {String} email email
   * @apiBody {String} password password
   *
   * @apiSuccess {String} id the user id has just been created
   * @apiSuccess {String} name the user name
   * @apiSuccess {String} email the user email
   * @apiSuccess {String} password the user password
   * @apiSuccess {String} accessToken AccessToken
   * @apiSuccess {String} refreshToken RefreshToken
   *
   * @apiSuccessExample Success-Response
   *  HTTP/1.1 200 OK
   * {
      "user": {
                "id": "624baad608f0ea0de8b1cfa1",
                "email": "han dan",
                "name": "Dan Han"
                "password": "$2b$10$DtC1dO/1DFyuR/4zg/RmcuaRxjhgsMnysLVqSAfdPjVlZ3/uJ2vK.",
                "createdAt": 1649126102496,
                "updatedAt": 1649126102496,
              },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.._k-1QIcbqaI6uU2OIaKPFCsVjV72sk8HhFMnsxrOPzE",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..gBE79T7CWS1RF6jn1rwvMjqeaUIALZv0dvEhiAbw52Q"
   * }
   *
   * @apiErrorExample Error - No password or email 
   *  HTTP/1.1 400 Bad Request
   * {
   *  "error": "Email and password required"
   * }
   * 
   * @apiErrorExample Error - Wrong password
   *  HTTP/1.1 403 Forbidden
   * {
   *  "error": "Mismatch passwords"
   * }
   */
  login: async (req, res) => {
    try {
      const data = req.body;

      if (!data.email || !data.password) {
        return res.badRequest('Email and password required');
      }

      const user = await Users.findOne({ email: data.email });

      if (!user) {
        return res.notFound();
      }

      await Users.comparePassword(data.password, user.password);

      const accessToken = jwToken.sign(
        { id: user.id, name: user.name },
        1000 * 60 * 15
      );
      const refreshToken = jwToken.sign(
        { id: user.id, name: user.name },
        1000 * 60 * 60 * 12
      );

      return res.send({
        user,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } catch (error) {
      return res.json(403, { error });
    }
  },

  /**
   * @api {PUT} /users/624b9b512ac9da3a281b1d52/edit Edit user
   * @apiName EditUser
   * @apiGroup User
   *
   * @apiHeader {String} token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.._k-1QIcbqaI6uU2OIaKPFCsVjV72sk8HhFMnsxrOPzE
   * 
   * @apiBody {String} name maybe edit field name or not
   * @apiBody {String} email maybe edit field email or not
   *
   * @apiSuccess {String} id the user id has just been created
   * @apiSuccess {String} name the user name
   * @apiSuccess {String} email the user email
   * @apiSuccess {String} password the user password
   * @apiSuccess {String} createdAt createdAt
   * @apiSuccess {String} updatedAt updatedAt
   *
   * @apiSuccessExample Success-Response
   *  HTTP/1.1 200 OK
   * {
      "id": "624b9b512ac9da3a281b1d52",
      "name": "Dan",
      "email": "danhan@gmail.com"
   * }
   *
   * @apiErrorExample Error-Response      
   *  HTTP/1.1 404 Not Found
   * "User was not found!"
   */
  edit: async (req, res) => {
    const user = await Users.updateOne({ _id: req.params.id }).set(req.body);

    if (!user) {
      return res.json(404, 'User was not found!');
    }

    res.send({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  },

  /**
   * @api {DELETE} /users/624b9b512ac9da3a281b1d52/edit Delete user
   * @apiName DeleteUser
   * @apiGroup User
   *
   * @apiHeader {String} token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.._k-1QIcbqaI6uU2OIaKPFCsVjV72sk8HhFMnsxrOPzE
   *
   * @apiSuccessExample Success-Response
   *  HTTP/1.1 200 OK
   *  "Deleted user with 624b9b512ac9da3a281b1d52"
   *
   * @apiErrorExample Error-Response
   *  HTTP/1.1 404 Not Found
   *  "The database does not have a user with 624b9b512ac93a281b1d52"
   */
  delete: async (req, res) => {
    const deleteUser = await Users.destroyOne({ _id: req.params.id });

    if (deleteUser) {
      res.send(`Deleted user with ${req.params.id}`);
    } else {
      res.json(404, `The database does not have a user with ${req.params.id}`);
    }
  },

  /**
   * @api {GET} /users/search?id=624b9e34d2bae24d1885fdff&email=dan Search User
   * @apiName SearchUsers
   * @apiGroup User
   * 
   * @apiHeader {String} token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.._k-1QIcbqaI6uU2OIaKPFCsVjV72sk8HhFMnsxrOPzE
   * 
   * @apiQuery {String} id Users unique Id
   * @apiQuery {String} email email
   * 
   * @apiSuccess {String} id The users id.
   * @apiSuccess {String} email The users email.
   * @apiSuccess {String} name The users name.
   * 
   * @apiSuccessExample Success-Response
   *  HTTP/1.1 200 OK
   * {
      {
      "id": "624b9e34d2bae24d1885fdff",
      "email": "dan",
      "name": "Dan Han"
      }
   * }
   * 
   * @apiErrorExample Error-Response:
   *  HTTP/1.1 404 Not Found
   * {
   *  "error": "UserNotFound"
   * }
   */
  search: async (req, res) => {
    const users = await Users.find({
      _id: req.query.id,
      email: req.query.email,
    });

    if (users) {
      res.send(
        users.map((user) => {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        })
      );
    } else {
      res.send(`The database does not have a user with ${req.query.id}`);
    }
  },
};
