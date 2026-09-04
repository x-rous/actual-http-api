process.env.API_KEY = process.env.API_KEY || 'test-api-key';
process.env.ACTUAL_SERVER_PASSWORD = process.env.ACTUAL_SERVER_PASSWORD || 'test-password';

describe('Account Groups Routes', () => {
  let mockRouter;
  let mockBudget;
  let mockReq;
  let mockRes;
  let mockNext;
  let handlers;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    handlers = {};

    mockRouter = {
      get: jest.fn((path, handler) => {
        handlers[`GET ${path}`] = handler;
      }),
      post: jest.fn((path, handler) => {
        handlers[`POST ${path}`] = handler;
      }),
      patch: jest.fn((path, handler) => {
        handlers[`PATCH ${path}`] = handler;
      }),
      delete: jest.fn((path, handler) => {
        handlers[`DELETE ${path}`] = handler;
      }),
    };

    mockBudget = {
      getAccountGroups: jest.fn().mockResolvedValue([
        { id: 'ag1', name: 'Everyday Banking' },
        { id: 'ag2', name: 'Savings' }
      ]),
      getAccountGroup: jest.fn().mockResolvedValue({ id: 'ag1', name: 'Everyday Banking' }),
      createAccountGroup: jest.fn().mockResolvedValue('new-account-group'),
      updateAccountGroup: jest.fn().mockResolvedValue(undefined),
      deleteAccountGroup: jest.fn().mockResolvedValue(undefined),
    };

    mockReq = {
      params: {},
      body: {},
      query: {}
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      locals: {
        budget: mockBudget,
      },
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /budgets/:budgetSyncId/accountgroups', () => {
    it('should register the route', () => {
      require('../../../src/v1/routes/account-groups')(mockRouter);

      expect(mockRouter.get).toHaveBeenCalledWith(
        '/budgets/:budgetSyncId/accountgroups',
        expect.any(Function)
      );
    });

    it('should return the list of account groups', async () => {
      require('../../../src/v1/routes/account-groups')(mockRouter);

      await handlers['GET /budgets/:budgetSyncId/accountgroups'](mockReq, mockRes, mockNext);

      expect(mockBudget.getAccountGroups).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        data: [
          { id: 'ag1', name: 'Everyday Banking' },
          { id: 'ag2', name: 'Savings' }
        ]
      });
    });

    it('should forward errors to next', async () => {
      require('../../../src/v1/routes/account-groups')(mockRouter);

      const error = new Error('Database error');
      mockBudget.getAccountGroups.mockRejectedValueOnce(error);

      await handlers['GET /budgets/:budgetSyncId/accountgroups'](mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('POST /budgets/:budgetSyncId/accountgroups', () => {
    it('should create an account group', async () => {
      require('../../../src/v1/routes/account-groups')(mockRouter);

      mockReq.body = { account_group: { name: 'Everyday Banking' } };

      await handlers['POST /budgets/:budgetSyncId/accountgroups'](mockReq, mockRes, mockNext);

      expect(mockBudget.createAccountGroup).toHaveBeenCalledWith({ name: 'Everyday Banking' });
      expect(mockRes.json).toHaveBeenCalledWith({ data: 'new-account-group' });
    });

    it('should reject an empty body', async () => {
      require('../../../src/v1/routes/account-groups')(mockRouter);

      mockReq.body = {};

      await handlers['POST /budgets/:budgetSyncId/accountgroups'](mockReq, mockRes, mockNext);

      expect(mockBudget.createAccountGroup).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'account_group information is required'
      }));
    });

    it('should reject a body that is not wrapped in account_group', async () => {
      require('../../../src/v1/routes/account-groups')(mockRouter);

      mockReq.body = { name: 'Everyday Banking' };

      await handlers['POST /budgets/:budgetSyncId/accountgroups'](mockReq, mockRes, mockNext);

      expect(mockBudget.createAccountGroup).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('GET /budgets/:budgetSyncId/accountgroups/:accountGroupId', () => {
    it('should return a single account group', async () => {
      require('../../../src/v1/routes/account-groups')(mockRouter);

      mockReq.params.accountGroupId = 'ag1';

      await handlers['GET /budgets/:budgetSyncId/accountgroups/:accountGroupId'](mockReq, mockRes, mockNext);

      expect(mockBudget.getAccountGroup).toHaveBeenCalledWith('ag1');
      expect(mockRes.json).toHaveBeenCalledWith({
        data: { id: 'ag1', name: 'Everyday Banking' }
      });
    });

    it('should return not found for a nonexistent account group', async () => {
      require('../../../src/v1/routes/account-groups')(mockRouter);

      mockReq.params.accountGroupId = 'nonexistent';
      mockBudget.getAccountGroup.mockResolvedValueOnce(undefined);

      await handlers['GET /budgets/:budgetSyncId/accountgroups/:accountGroupId'](mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Account group not found'
      }));
    });
  });

  describe('PATCH /budgets/:budgetSyncId/accountgroups/:accountGroupId', () => {
    it('should update an account group', async () => {
      require('../../../src/v1/routes/account-groups')(mockRouter);

      mockReq.params.accountGroupId = 'ag1';
      mockReq.body = { account_group: { name: 'Renamed' } };

      await handlers['PATCH /budgets/:budgetSyncId/accountgroups/:accountGroupId'](mockReq, mockRes, mockNext);

      expect(mockBudget.updateAccountGroup).toHaveBeenCalledWith('ag1', { name: 'Renamed' });
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Account group updated' });
    });

    it('should reject an empty body', async () => {
      require('../../../src/v1/routes/account-groups')(mockRouter);

      mockReq.params.accountGroupId = 'ag1';
      mockReq.body = {};

      await handlers['PATCH /budgets/:budgetSyncId/accountgroups/:accountGroupId'](mockReq, mockRes, mockNext);

      expect(mockBudget.updateAccountGroup).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'account_group information is required'
      }));
    });

    it('should return not found for a nonexistent account group', async () => {
      require('../../../src/v1/routes/account-groups')(mockRouter);

      mockReq.params.accountGroupId = 'nonexistent';
      mockReq.body = { account_group: { name: 'Renamed' } };
      mockBudget.getAccountGroup.mockResolvedValueOnce(undefined);

      await handlers['PATCH /budgets/:budgetSyncId/accountgroups/:accountGroupId'](mockReq, mockRes, mockNext);

      expect(mockBudget.updateAccountGroup).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Account group not found'
      }));
    });
  });

  describe('DELETE /budgets/:budgetSyncId/accountgroups/:accountGroupId', () => {
    it('should delete an account group', async () => {
      require('../../../src/v1/routes/account-groups')(mockRouter);

      mockReq.params.accountGroupId = 'ag1';

      await handlers['DELETE /budgets/:budgetSyncId/accountgroups/:accountGroupId'](mockReq, mockRes, mockNext);

      expect(mockBudget.deleteAccountGroup).toHaveBeenCalledWith('ag1');
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Account group deleted' });
    });

    it('should return not found for a nonexistent account group', async () => {
      require('../../../src/v1/routes/account-groups')(mockRouter);

      mockReq.params.accountGroupId = 'nonexistent';
      mockBudget.getAccountGroup.mockResolvedValueOnce(undefined);

      await handlers['DELETE /budgets/:budgetSyncId/accountgroups/:accountGroupId'](mockReq, mockRes, mockNext);

      expect(mockBudget.deleteAccountGroup).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Account group not found'
      }));
    });
  });
});
