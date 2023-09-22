function getRequestFailed(typeReqest,route) {
  return `The request to ${typeReqest + " " + route} failed`
}

exports.getRequestFailed = getRequestFailed;
