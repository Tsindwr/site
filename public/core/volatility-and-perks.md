---
tags: ttrpg, rules
aliases:
  - Volatility
  - Perks
  - jinx threshold
---
# Volatility and Perks
## Modifying Success Levels
###### *Volatility*

The **Volatility Die** is a special modifier to a Test roll, but only applies under certain conditions. In order to add a Volatility Die or Volatility Dice to a Test, a player must satisfy one or more of the following scenarios:

- If a player has proficiency in the Skill associated with the Test, add a Volatility Die.
- If a player has Volatility in one or more Domains relevant to this Test, add a Volatility Die.
- If a player has a Knack associated with this Test, add a Volatility Die per relevant Knack.
- If a player otherwise has an ability allowing additional Volatility Dice to be added to the rolling pool, add those as well.

After adding each applicable Volatility Die, a player now has their Volatility Pool for this roll. The result for a Volatility Pool is determined by the die that rolled highest.

>[!check]+ The Help Action
>Taking the Help Action requires a player to declare an intention of how their actions will assist a target with a goal. This allows a player to give the target [[resolution-system#Risky Tests|Advantage]] on that Test, effectively lowering the Riskiness of that roll.

The role of Volatility in a Test is to modify its base success level. Volatility represents a creature's association or experience with a given activity, giving them an opportunity to turn a failure into a success, but also risking the chance of decreasing the success level. 
### Introducing: Explosive Gameplay

**Volatility Dice**, in combination with Perks and Proficiencies, capture both a character's experience with certain actions, as well as their accumulative control over such subjects. A player's Volatility Die begins at a D4 in each Potential, but can be leveled up as gameplay goes on. After rolling all dice in the Volatility Pool and determining the resulting die, the player then resolves any **Perks** assigned to that die's number result. The player then modifies their D20 [[resolution-system|Test]] based on the final result.

Like in Tests, the thresholds of Volatility Dice are impacted by an external feature: **Stress**. Stress represents the amount of strain a creature has accumulated from external influence and exertion. Stress is more common than Resistance Drain, but is easier to reset and recover from.

A Volatility die's **jinx threshold** is determined by the amount of Stress a player has in the respective Potential. The jinx threshold can only be less than the maximum value on a Volatility Die. After rolling their Volatility Pool, if a player's chosen Volatility Die results as within the jinx threshold, the overall success level is decreased by 1. Otherwise, the success level is increased by 1.

## Perks of the Profession
###### Perks

**Perks** allow all players, including the GM, to level up their Volatility rolls and tips the odds in their favor. Perks give Volatility results a secondary effect, which can turn the tides in an integral Test. Perks are bought using the [[experience|Experience Points]] system, oftentimes only costing a few [[experience|Beats]] (these are low-cost abilities).

A Perk can be assigned to a specific slot on a Volatility Die. A slot is any number on the Volatility Die that is neither its maximum or minimum value. Assigning a Perk to a slot, moving a Perk to a new slot, or swapping two assigned Perks requires spending 1 Beat. A creature can only assign Perks to slots that are equal to their Potential score or lower.

| Volatility | # of Perk Slots |
| ---------- | --------------- |
| D4         | 2               |
| D6         | 4               |
| D8         | 6               |
| D10        | 8               |
| D12        | 10              |

When all Perk slots on a Die are filled, a special Perk is unlocked for that Volatility Die. This special Perk is called a Charge, and is purchasable for a number of Beats equal to the number of Perk slots on the Volatility Die. When Charged, a Volatility Die explodes when rolling the maximum value on the Volatility Die when its jinx threshold is maxxed out.

Exploding a Volatility Die during a Test causes an automatic Crit, and gives a creature the following benefits:
- If your Volatility Die is not already a D12, it becomes one die type higher from now on. For now, it is empty of Perks.
- You are given 1 usage of the Surge: Recollect (see below).
- You gain 1 String.
- You may immediately purchase a new Ability from the [[abilities|Experience Market]].

> [!info]+ Recollect Surge
> The Recollect Surge allows a player to reapply the Perks they had assigned to their previous Volatility Die before it exploded. This action only applies to the Volatility Die that generated its usage. This will be referred to as the Previous Die hereafter. 
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

[^1]: See [[stress-and-fallout|Fallout]]. Once Fallout is triggered, that Potential's Stress track is reset to 0.