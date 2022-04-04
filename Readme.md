# **How to run the tests**

- Install nodejs and npm ([https://nodejs.org/en/](https://nodejs.org/en/))
- Install truffle:

```Bash
npm install -g truffle
truffle version
```

- Run the following commands:
   - `truffle test`
   - For event test `truffle --show-events`


<br/><br/>
# **Notes**

- The contract allows multiple proposals by the same account
- In setVote function, third require condition should be   `_id <  proposalArray.length`
- It sets the proposal with lower id as the winner in case of draw.

<br/><br/>
# **Testing**

As part of a unit test, I tested the deployment of the smart contract and structured my test by scenario:

- Workflow status
- Registration of voters
- added proposal
- Sending votes
- The counting of votes

For each scenario, I implement exception (error) handling using a utility file that contains an asynchronous function named `shouldThrow`

### example:

```javascript
it('should not allow a voter to register themself', async () => {
      await utils.shouldThrow(
        contractInstance.addVoter(voter1, { from: voter1 })
      );
    });
```

### ***`total number of tests: 30`***

