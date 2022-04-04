# <span style="color: #FFBD59">**How to run the tests**</span>

- Install nodejs and npm ([https://nodejs.org/en/](https://nodejs.org/en/))
- Install truffle:

```Bash
npm install -g truffle
truffle version
```

- Run the following commands:
  - <i>truffle test</i>
  - For event test <i>truffle --show-events</i>

<br/><br/>

# **Notes**

- The contract allows multiple proposals by the same account
- In setVote function, third require condition should be _id < proposalArray.length_
- It sets the proposal with lower id as the winner in case of draw.

<br/><br/>

# **Testing**

As part of a unit test, I tested the deployment of the smart contract and structured my test by scenario:

- Workflow status
- Registration of voters
- added proposal
- Sending votes
- The counting of votes

For each scenario, I implement exception (error) handling using a utility file that contains an asynchronous function named _shouldThrow_

### example:

```javascript
it('should not allow a voter to register themself', async () => {
  await utils.shouldThrow(contractInstance.addVoter(voter1, { from: voter1 }));
});
```

_total number of tests: 30_

<style>H1{color:#FFBD59;}</style>
<style>H2{color:#FFBD59;}</style>
<style>em{color:#5762B7;}</style>
<style>i{color:#FFBD59; background-color:#5762B7; padding: .2rem .4rem; border-radius: .2rem;}</style>
