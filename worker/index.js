export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "sister-day.q5m.io") {
      url.hostname = "sister-day.q5m.ai";
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
