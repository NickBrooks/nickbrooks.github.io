var userFeed = new Instafeed({
    get: 'user',
    userId: '31813561',
    accessToken: '31813561.1677ed0.77caa2ce32c14632aad1c1989a2a5ca9',
    template: '<div class="col-xs-12 col-sm-3 insta-thumb"><a href="{{link}}"><img src="{{image}}" /></a></div>',
    limit: 8,
    resolution: 'standard_resolution'
});
userFeed.run();