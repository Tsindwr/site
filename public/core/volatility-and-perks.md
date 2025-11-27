---
tags: ttrpg, rules
---
# Volatility and Perks
## Introducing: Explosive Gameplay
###### Volatility

**Volatility dice**, in combination with Perks and Proficiencies, capture both a character's experience with certain actions, as well as their accumulative control over such subjects. A player's Volatility pool is determined by a character's Proficiency in the roll's relative [[potentials|Skill]], an applicable [[potentials|Domain]], and any pertinent [[potentials|Knacks]]. For each one of these, add a die to the Volatility pool; a Volatility's die is determined by a character's spent **Perks** in the current [[potentials|Potential]] score, beginning at a D4. After rolling all dice in the pool, a player chooses one die as their result, then resolves any **Perks** assigned to that die's number result. The player then modifies their D20 [[resolution-system|Test]] based on the final result.

A Volatility die's **jinx threshold** is determined by the amount of Stress a player has in the respective Potential. The jinx threshold cannot be more than one less than the maximum value on a Volatility Die. After rolling their Volatility pool, if a player's chosen Volatility Die results as within the jinx threshold and the Test results in a success level of 4 or less (success level with cost/Success*-), then it triggers Fallout[^1]. Additionally, if the chosen Volatility die results as within the jinx threshold and the Test results in a success level of 3 or more (Mixed+), then the player gains a point of [[stress-fallout-and-marks|Stress]] in the relevant [[potentials|Potential]] track.

## Perks of the Profession
###### Perks

**Perks** allow all players, including the GM, to level up their Volatility rolls and tips the odds in their favor. Perks give Volatility results a secondary effect, which can turn the tides in an integral Test. Perks are bought using the [[Experience Points]] system, oftentimes only costing a few [[Experience Points|Beats]] (these are low-cost abilities).

A Perk can be assigned to a specific slot on a Volatility die. A slot is any number on the Volatility die that is neither its maximum or minimum value. Assigning a Perk to a slot, moving a Perk to a new slot, or swapping two assigned Perks requires spending 1 Beat. A creature can only assign Perks to slots that are equal to their Potential score or lower.

| Volatility | # of Perk Slots |
| ---------- | --------------- |
| D4         | 2               |
| D6         | 4               |
| D8         | 6               |
| D10        | 8               |
| D12        | 10              |

When all Perk slots on a Die are filled, a special Perk is unlocked for that Volatility Die. This special Perk is called a Charge, and is purchasable for a number of Beats equal to the number of Perk slots on the Volatility Die. When Charged, a Volatility Die explodes when rolling the maximum value on the Volatility Die when its jinx threshold is maxxed out.

Exploding a Volatility Die during a Test causes an automatic crit, and gives a creature the following benefits:
- If your Volatility Die is not already a D12, it becomes one die type higher from now on. For now, it is empty of Perks.
- You are given 1 usage of the Bonus Action: Recollect (see below).
- You gain 1 Thread.
- You gain the benefits of a Short Rest.

> [!info]+ Recollect Bonus Action
> The Recollect Bonus Action allows a player to reapply the Perks they had assigned to their previous Volatility Die before it exploded. This action only applies to the Volatility Die that generated its usage. This will be referred to as the Previous Die hereafter. 
> 
> When used, this action causes the creature to regain a number of Special Beats equal to the Previous Die's number of Perk Slots. These Special Beats can only be used during this action. The creature may immediately spend these Beats to reassign their purchased Perks to the new Volatility Die. 
### Purchasable Perks

Perks' effects activate after a player has rolled their Volatility Pool and choose the highest value.

| Cost | Name     | Description                                                                                                                                                             |
| ---- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2    | Refresh  | Remove 1 Stress from this Potential's track                                                                                                                             |
| 2    | Implode  | If your Volatility Die is not already a D4, roll one Die level below your current Die size and take the resulting value.                                                |
| 3    | Cleave   | Roll 2 Volatility Dice instead, taking the result furthest from the middle. If they are equidistant, take the higher.                                                   |
| 3    | Drive    | Reroll the kept die and take the resulting value.                                                                                                                       |
| 5    | Burn     | Spend 1 Resistance for an automatic max Volatility value.                                                                                                               |
| 5    | Fracture | When activating this Perk while its slot is in the jinx threshold, its result is considered the highest value on the Die. Otherwise, it is considered the lowest value. |


[^1]: See [[stress-fallout-and-marks|Fallout]]. Once Fallout is triggered, that Potential's Stress track is reset to 0.
