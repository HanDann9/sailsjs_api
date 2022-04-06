/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  /**
   * @api {GET} /auth/refresh Refresh token
   * @apiName RefreshToken
   * @apiGroup Auth
   *
   * @apiHeader {String} token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.._k-1QIcbqaI6uU2OIaKPFCsVjV72sk8HhFMnsxrOPzE
   *
   * @apiSuccessExample Success-Response
   *  HTTP/1.1 200 OK
   *  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..LKe-O6OdhjNVH7iqlUrgPTXO9VhnTZ1auRQ48knYEyU"
   *
   * @apiErrorExample Error-Response
   *  HTTP/1.1 401 Unauthorized
   *  "err": "Invalid Token!"
   */
  refreshToken: (req, res) => {
    const payload = req.payload;
    const accessToken = jwToken.sign(
      { id: payload.id, name: payload.name },
      1000 * 60 * 15
    );
    res.send({ accessToken: accessToken });
  },
};
