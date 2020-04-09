function actionWrapper(type) {
  return (value) => {
    return { type, value };
  };
}

export function wrappedActions(mapping) {
  const wrappedMapping = {};
  const actionFunctionNames = Object.keys(mapping);
  let actionIndex;
  for (
    actionIndex = 0;
    actionIndex < actionFunctionNames.length;
    actionIndex += 1
  ) {
    const actionFunctionName = actionFunctionNames[actionIndex];
    const actionType = mapping[actionFunctionName];
    wrappedMapping[actionFunctionName] = actionWrapper(actionType);
  }
  return wrappedMapping;
}

function numberedActionWrapper(type) {
  return (number, value) => {
    return { type, number, value };
  };
}

export function wrappedNumberedActions(mapping) {
  const wrappedMapping = {};
  const actionFunctionNames = Object.keys(mapping);
  let actionIndex;
  for (
    actionIndex = 0;
    actionIndex < actionFunctionNames.length;
    actionIndex += 1
  ) {
    const actionFunctionName = actionFunctionNames[actionIndex];
    const actionType = mapping[actionFunctionName];
    wrappedMapping[actionFunctionName] = numberedActionWrapper(actionType);
  }
  return wrappedMapping;
}
