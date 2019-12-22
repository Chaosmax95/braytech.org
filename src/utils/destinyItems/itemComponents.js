export const itemComponents = (item, member) => {
  let data = {};

  if (!item.itemInstanceId || !member.data) return null;
  
  // collects relevant instanced data for sockets and stats utils
  if (item.itemInstanceId && member.data?.profile.itemComponents?.instances?.data[item.itemInstanceId]) {
    const instancesTypes = ['instance', 'sockets', 'plugObjectives', 'reusablePlugs', 'perks', 'stats', 'objectives', 'talentGrids'];

    data = instancesTypes.reduce((obj, key) => {
      if (key === 'instance') {
        obj[key] = member.data.profile.itemComponents.instances.data[item.itemInstanceId] || null;
        return obj;
      } else if (['plugObjectives', 'reusablePlugs', 'talentGrids'].includes(key)) {
        obj[key] = member.data.profile.itemComponents[key].data[item.itemInstanceId] || null;
        return obj;
      } else {
        obj[key] = member.data.profile.itemComponents[key].data[item.itemInstanceId]?.[key] || null;
        return obj;
      }
    }, {})
  }

  // characterUninstancedItemComponents
  if (member.data?.profile.characterUninstancedItemComponents[member.characterId]?.objectives?.data[item.itemHash]) {
    data = {
      ...data,
      objectives: member.data.profile.characterUninstancedItemComponents[member.characterId].objectives.data[item.itemHash].objectives
    };
  }

  // what's this for?
  if (item.itemInstanceId && member.data && member.data.profile?.characterInventories?.data[member.characterId]?.items?.find(i => i.itemInstanceId === item.itemInstanceId)) {
    data = {
      ...data,
      item: member.data.profile.characterInventories.data[member.characterId].items.find(i => i.itemInstanceId === item.itemInstanceId)
    }
  }

  return data;

}