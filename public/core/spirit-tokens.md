# Spirit Tokens

## The Party Loom

Each party of adventurers is given a Loom: a track of story points that records their progress and party level. This Loom also determines how many Spirit Tokens they may hold. The maximum number of Spirit Tokens is determined by half of the number of story points needed to level up the party rounded down (see below).
### Party Levelling

Levelling up a party requires a certain amount of story points. This number is determined by the following equation:

$$
U=(2N+NL) \\
U=\mathrm{level-up~requirement} \\
L=\mathrm{current~party~level~(minimum~of~1)} \\
N=\mathrm{number~of~players}
$$


When a party levels up, each character gains a [[experience|String]]. In addition, they gain a Loom Boon (see below) and refresh all Spirit Tokens.

### Story Checkpoints

There are checkpoints in each leveling track at indices that satisfy the condition:

$$
u\mod{(L+4)}=0 \\
L = \mathrm{current~party~level~(minimum~of~1)} \\
u = \mathrm{current~amount~of~story~points}
$$

*Note: index at 1.*

When a party reaches a checkpoint, either:
1. Refresh a number of Spirit Tokens equal to a roll of the party's lowest Volatility Die.
2. Clear 1 Stress from each party member.
3. One player gains a String.
4. Unlock a new Loom Boon based on the current environment.

## Using the Loom

An adventuring party as access to a communal pool of Spirit Tokens, representing the heroic resolve of our story. The number of tokens is determined by the number of players plus the current party level (minimum of 1).

### Loom Boons

**Loom Boons** are party abilities that can be activated by any initiated member of the party. Some Loom Boons have limits to how many times they can be used, which is denoted by either "1/Long Rest" (once per Long Rest) or "1/Short Rest" (once per Short Rest). Some Loom Boons require a Spirit Token to be expended in order to use this. The party's Spirit Token pool should be tracked by the Loom in a shared location. Spirit Tokens can be earned using Story Checkpoints or by converting Flavor Tokens[^1].

Here are some examples of general Loom Boons a party can earn when leveling up. A new party chooses one Loom Boon to start with.

**Buff** - *before making a roll, add an additional Volatility Die* (1/Short Rest)
**Recoup** - *during a Short Rest, expend a Spirit Token to regain a number of Marks equal to a roll of your Nerve Volatility Die* (1/Long Rest)
**Tutelage** - *add a Volatility Die to an ally's roll if you have proficiency in a relative Domain* (1/Long Rest)
**Shared Fortune** - *on a Crit, you may designate an ally to be given an extra Volatility Die on their next roll* (1/Long Rest)
**Protective Instinct** - *when an ally takes Fallout, any one member of the party can be granted an extra Volatility Die when that member takes an Action to protect the affected ally* (1/Short Rest)
**Bulwark** - *expend a Spirit Token when a close ally is affected with physical Stress to take the Stress instead of them*

[^1]: To be published in a later version.