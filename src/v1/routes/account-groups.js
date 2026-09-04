const { isEmpty } = require('../../utils/utils');

/**
 * @swagger
 * tags:
 *   - name: Account Groups
 *     description: Endpoints for managing account groups. See [Accounts official documentation](https://actualbudget.org/docs/api/reference#accounts)
 * components:
 *   parameters:
 *     accountGroupId:
 *       name: accountGroupId
 *       in: path
 *       schema:
 *         type: string
 *       required: true
 *       description: Account group id
 *   schemas:
 *     AccountGroup:
 *       required:
 *         - name
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 */

module.exports = (router) => {
  /**
   * @swagger
   * /budgets/{budgetSyncId}/accountgroups:
   *   get:
   *     summary: Returns list of account groups
   *     tags: [Account Groups]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: The list of account groups
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/AccountGroup'
   *               examples:
   *                 - data:
   *                   - id: 'f733399d-4ccb-4758-b208-7422b27f650a'
   *                     name: 'Everyday Banking'
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/accountgroups', async (req, res, next) => {
    try {
      res.json({'data': await res.locals.budget.getAccountGroups()});
    } catch(err) {
      next(err);
    }
  });

  /**
   * @swagger
   * /budgets/{budgetSyncId}/accountgroups:
   *   post:
   *     summary: Creates an account group
   *     tags: [Account Groups]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             required:
   *               - account_group
   *             type: object
   *             properties:
   *               account_group:
   *                 $ref: '#/components/schemas/AccountGroup'
   *             examples:
   *               - account_group:
   *                   name: 'Everyday Banking'
   *     responses:
   *       '200':
   *         description: Id of the account group created
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   type: string
   *                   description: Id of the account group created
   *               examples:
   *                 - data: 'f733399d-4ccb-4758-b208-7422b27f650a'
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.post('/budgets/:budgetSyncId/accountgroups', async (req, res, next) => {
    try {
      validateAccountGroupBody(req.body.account_group);
      res.json({'data': await res.locals.budget.createAccountGroup(req.body.account_group)});
    } catch(err) {
      next(err);
    }
  });

  /**
   * @swagger
   * /budgets/{budgetSyncId}/accountgroups/{accountGroupId}:
   *   get:
   *     summary: Returns an account group
   *     tags: [Account Groups]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/accountGroupId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: The account group
   *         content:
   *           application/json:
   *             schema:
   *               required:
   *                 - data
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/AccountGroup'
   *               examples:
   *                 - data:
   *                     id: 'f733399d-4ccb-4758-b208-7422b27f650a'
   *                     name: 'Everyday Banking'
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.get('/budgets/:budgetSyncId/accountgroups/:accountGroupId', async (req, res, next) => {
    try {
      res.json({'data': await getAccountGroupOrFail(res, req.params.accountGroupId)});
    } catch(err) {
      next(err);
    }
  });

  /**
   * @swagger
   * /budgets/{budgetSyncId}/accountgroups/{accountGroupId}:
   *   patch:
   *     summary: Updates an account group
   *     tags: [Account Groups]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/accountGroupId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             required:
   *               - account_group
   *             type: object
   *             properties:
   *               account_group:
   *                 $ref: '#/components/schemas/AccountGroup'
   *             examples:
   *               - account_group:
   *                   name: 'Everyday Banking'
   *     responses:
   *       '200':
   *         description: Confirmation message
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Account group updated
   *       '400':
   *         $ref: '#/components/responses/400'
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.patch('/budgets/:budgetSyncId/accountgroups/:accountGroupId', async (req, res, next) => {
    try {
      validateAccountGroupBody(req.body.account_group);
      await getAccountGroupOrFail(res, req.params.accountGroupId);
      await res.locals.budget.updateAccountGroup(req.params.accountGroupId, req.body.account_group);
      res.json({'message': 'Account group updated'});
    } catch(err) {
      next(err);
    }
  });

  /**
   * @swagger
   * /budgets/{budgetSyncId}/accountgroups/{accountGroupId}:
   *   delete:
   *     summary: Deletes an account group. Accounts belonging to the group are kept and become ungrouped
   *     tags: [Account Groups]
   *     security:
   *       - apiKey: []
   *     parameters:
   *       - $ref: '#/components/parameters/budgetSyncId'
   *       - $ref: '#/components/parameters/accountGroupId'
   *       - $ref: '#/components/parameters/budgetEncryptionPassword'
   *     responses:
   *       '200':
   *         description: Confirmation message
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeneralResponseMessage'
   *               examples:
   *                 - message: Account group deleted
   *       '404':
   *         $ref: '#/components/responses/404'
   *       '500':
   *         $ref: '#/components/responses/500'
   */
  router.delete('/budgets/:budgetSyncId/accountgroups/:accountGroupId', async (req, res, next) => {
    try {
      await getAccountGroupOrFail(res, req.params.accountGroupId);
      await res.locals.budget.deleteAccountGroup(req.params.accountGroupId);
      res.json({'message': 'Account group deleted'});
    } catch(err) {
      next(err);
    }
  });

  async function getAccountGroupOrFail(res, accountGroupId) {
    const accountGroup = await res.locals.budget.getAccountGroup(accountGroupId);
    if (!accountGroup) {
      throw new Error('Account group not found');
    }
    return accountGroup;
  }

  function validateAccountGroupBody(accountGroup) {
    if (isEmpty(accountGroup)) {
      throw new Error('account_group information is required');
    }
  }
}
