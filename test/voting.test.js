const Voting = artifacts.require('Voting');
const utils = require('./helpers/utils');

contract('Voting', (accounts) => {
  let [admin, voter1, voter2, voter3, voter4, account5, account6, nonvoter] =
    accounts;
  let contractInstance;

  it('should assert true', () => {
    assert.isTrue(true);
  });

  it('should deploy the smart contract properly', async () => {
    contractInstance = await Voting.new();
    assert.notEqual(contractInstance.address, '');
  });

  context('with the workflow status scenario', async () => {
    it('should return RegisteringVoters (0)', async () => {
      const status = await contractInstance.workflowStatus();
      assert.equal(status, 0);
    });
    it('should return ProposalsRegistrationStarted (1)', async () => {
      await contractInstance.startProposalsRegistering();
      const status = await contractInstance.workflowStatus();
      assert.equal(status, 1);
    });
    it('should return ProposalsRegistrationEnded (2)', async () => {
      await contractInstance.endProposalsRegistering();
      const status = await contractInstance.workflowStatus();
      assert.equal(status, 2);
    });
    it('should return VotingSessionStarted (3)', async () => {
      await contractInstance.startVotingSession();
      const status = await contractInstance.workflowStatus();
      assert.equal(status, 3);
    });
    it('should return VotingSessionEnded (4)', async () => {
      await contractInstance.endVotingSession();
      const status = await contractInstance.workflowStatus();
      assert.equal(status, 4);
    });
    it('should return VotesTallied (5)', async () => {
      await contractInstance.tallyVotes();
      const status = await contractInstance.workflowStatus();
      assert.equal(status, 5);
    });
  });

  context('with the registration scenario', async () => {
    beforeEach(async () => {
      contractInstance = await Voting.new();
    });

    it('should be able to register a new voter', async () => {
      const result = await contractInstance.addVoter(voter1, { from: admin });
      assert.equal(result.receipt.status, true);
      assert.equal(result.logs[0].args.voterAddress, voter1);
    });

    it('should not allow a voter to register themself', async () => {
      await utils.shouldThrow(
        contractInstance.addVoter(voter1, { from: voter1 })
      );
    });

    it('should not be able to register a new voter if the registration is not open', async () => {
      await contractInstance.startProposalsRegistering();
      await utils.shouldThrow(
        contractInstance.addVoter(voter1, { from: admin })
      );
    });

    it('should not be able to register the same voter two times', async () => {
      await contractInstance.addVoter(voter1, { from: admin });
      await utils.shouldThrow(
        contractInstance.addVoter(voter1, { from: admin })
      );
    });

    it('should be able to register multiple voters', async () => {
      const result1 = await contractInstance.addVoter(voter1, { from: admin });
      assert.equal(result1.receipt.status, true);
      assert.equal(result1.logs[0].args.voterAddress, voter1);

      const result2 = await contractInstance.addVoter(voter2, { from: admin });
      assert.equal(result2.receipt.status, true);
      assert.equal(result2.logs[0].args.voterAddress, voter2);
    });
  });

  context('with the proposal scenario', async () => {
    beforeEach(async () => {
      contractInstance = await Voting.new();
      await contractInstance.addVoter(account5, { from: admin });
      await contractInstance.addVoter(account6, { from: admin });
    });

    it('should not be able to add a new proposal if the proposal registration has not started yet', async () => {
      await utils.shouldThrow(
        contractInstance.addProposal('test proposal by account5', {
          from: account5,
        })
      );
    });

    it('should not be able to add a new proposal if the proposal description is empty', async () => {
      await utils.shouldThrow(
        contractInstance.addProposal('', { from: account5 })
      );
    });

    it('should not allow non voter to add a new proposal', async () => {
      await contractInstance.startProposalsRegistering();
      await utils.shouldThrow(
        contractInstance.addProposal('test proposal by non voter', {
          from: nonvoter,
        })
      );
    });

    it('should be able to add a new proposal', async () => {
      await contractInstance.startProposalsRegistering();

      const result = await contractInstance.addProposal(
        'test proposal by account5',
        { from: account5 }
      );
      assert.equal(result.receipt.status, true);
    });

    it('should be able to add multiple different proposals', async () => {
      await contractInstance.startProposalsRegistering();

      const result1 = await contractInstance.addProposal(
        'test proposal by account5',
        { from: account5 }
      );
      assert.equal(result1.receipt.status, true);

      const result2 = await contractInstance.addProposal(
        'test proposal by account6',
        { from: account6 }
      );
      assert.equal(result2.receipt.status, true);
    });

    it('should allow multiple proposals by the same account', async () => {
      await contractInstance.startProposalsRegistering();

      const result1 = await contractInstance.addProposal(
        'test proposal by account5',
        { from: account5 }
      );
      assert.equal(result1.receipt.status, true);

      const result2 = await contractInstance.addProposal(
        'another test proposal by account5',
        { from: account5 }
      );
      assert.equal(result2.receipt.status, true);
    });
  });

  context('with the vote scenario', async () => {
    beforeEach(async () => {
      contractInstance = await Voting.new();
      await contractInstance.addVoter(voter1);
      await contractInstance.addVoter(voter2);
      await contractInstance.addVoter(voter3);
      await contractInstance.addVoter(voter4);

      await contractInstance.addVoter(account5);
      await contractInstance.addVoter(account6);

      await contractInstance.startProposalsRegistering();

      await contractInstance.addProposal('test proposal by account5', {
        from: account5,
      });
      await contractInstance.addProposal('test proposal by account6', {
        from: account6,
      });
    });

    it('should be able to set a vote', async () => {
      await contractInstance.endProposalsRegistering();
      await contractInstance.startVotingSession();

      const result = await contractInstance.setVote(1, { from: voter1 });
      assert.equal(result.receipt.status, true);
    });

    it('should not be able to set a vote if the voting session has not started yet', async () => {
      await contractInstance.endProposalsRegistering();
      await utils.shouldThrow(contractInstance.setVote(1, { from: voter1 }));
    });

    it('should not allow non voters to set a vote', async () => {
      await contractInstance.endProposalsRegistering();
      await contractInstance.startVotingSession();

      await utils.shouldThrow(contractInstance.setVote(1, { from: nonvoter }));
    });

    it('should not allow voters to set multiple votes', async () => {
      await contractInstance.endProposalsRegistering();
      await contractInstance.startVotingSession();

      await contractInstance.setVote(0, { from: voter1 });
      await utils.shouldThrow(contractInstance.setVote(1, { from: voter1 }));
    });

    it('should not allow voters to set votes on proposals that do not exist', async () => {
      await contractInstance.endProposalsRegistering();
      await contractInstance.startVotingSession();

      await utils.shouldThrow(contractInstance.setVote(2, { from: voter1 }));
    });
  });

  context('with the tally votes scenario', async () => {
    beforeEach(async () => {
      contractInstance = await Voting.new();
      await contractInstance.addVoter(voter1);
      await contractInstance.addVoter(voter2);
      await contractInstance.addVoter(voter3);
      await contractInstance.addVoter(voter4);

      await contractInstance.addVoter(account5);
      await contractInstance.addVoter(account6);

      await contractInstance.startProposalsRegistering();

      await contractInstance.addProposal('test proposal by account5', {
        from: account5,
      });
      await contractInstance.addProposal('test proposal by account6', {
        from: account6,
      });

      await contractInstance.endProposalsRegistering();
      await contractInstance.startVotingSession();
    });

    it('should not allow tallying votes before voting session end', async () => {
      await utils.shouldThrow(contractInstance.tallyVotes());
    });

    it('should allow tallying votes after voting session end', async () => {
      await contractInstance.endVotingSession();
      const result = await contractInstance.tallyVotes();
      assert.equal(result.receipt.status, true);
    });

    it('should not allow anyone other than owner(admin) to tally votes', async () => {
      await contractInstance.endVotingSession();
      await utils.shouldThrow(contractInstance.tallyVotes({ from: account5 }));
    });

    it('should set proposal id 0 as the winner', async () => {
      await contractInstance.setVote(0, { from: voter1 });
      await contractInstance.setVote(0, { from: voter2 });
      await contractInstance.setVote(1, { from: voter3 });
      await contractInstance.setVote(0, { from: voter4 });
      await contractInstance.setVote(0, { from: account5 });
      await contractInstance.setVote(1, { from: account6 });

      await contractInstance.endVotingSession();
      await contractInstance.tallyVotes();

      const winner = await contractInstance.winningProposalID();
      assert.equal(winner, 0);
    });

    it('should set proposal id 1 as the winner', async () => {
      await contractInstance.setVote(0, { from: voter1 });
      await contractInstance.setVote(1, { from: voter2 });
      await contractInstance.setVote(1, { from: voter3 });
      await contractInstance.setVote(1, { from: voter4 });
      await contractInstance.setVote(0, { from: account5 });
      await contractInstance.setVote(1, { from: account6 });

      await contractInstance.endVotingSession();
      await contractInstance.tallyVotes();

      const winner = await contractInstance.winningProposalID();
      assert.equal(winner, 1);
    });

    it('should set proposal id 0 as the winner in case of draw', async () => {
      await contractInstance.setVote(0, { from: voter1 });
      await contractInstance.setVote(0, { from: voter2 });
      await contractInstance.setVote(1, { from: voter3 });
      await contractInstance.setVote(1, { from: voter4 });
      await contractInstance.setVote(0, { from: account5 });
      await contractInstance.setVote(1, { from: account6 });

      await contractInstance.endVotingSession();
      await contractInstance.tallyVotes();

      const winner = await contractInstance.winningProposalID();
      assert.equal(winner, 0);
    });
  });
});
