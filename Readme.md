#  <span style="color: #FFBD59">**How to run the tests**</span>

- Install nodejs and npm ([https://nodejs.org/en/](https://nodejs.org/en/))
- Install truffle:

```Bash
npm install -g truffle
truffle version
```

- Run the following commands:
  - <span style="color: #FFBD59; background-color:#31356E; padding: .2rem .4rem; border-radius: .2rem">truffle test</span>
  - For event test <span style="color: #FFBD59; background-color:#31356E; padding: .2rem .4rem; border-radius: .2rem">truffle --show-events</span>

<br/><br/>

# <span style="color: #FFBD59">**Notes**</span>

- The contract allows multiple proposals by the same account
- In setVote function, third require condition should be <span style="color: #5762B7;">\_id proposalArray.length </span>
- It sets the proposal with lower id as the winner in case of draw.

<br/><br/>

# <span style="color: #FFBD59">**Testing**</span>

As part of a unit test, I tested the deployment of the smart contract and structured my test by scenario:

- Workflow status
- Registration of voters
- added proposal
- Sending votes
- The counting of votes

For each scenario, I implement exception (error) handling using a utility file that contains an asynchronous function named <span style="color: #5762B7;">`shouldThrow`</span>

### example:

```javascript
it('should not allow a voter to register themself', async () => {
  await utils.shouldThrow(contractInstance.addVoter(voter1, { from: voter1 }));
});
```

<span style="color: #5762B7;">_total number of tests: 30_ </span>
