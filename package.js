Package.describe({
  name: 'huaming:flux-store',
  version: '0.0.7',
  // Brief, one-line summary of the package.
  summary: 'This is a Simple Store for meteor inspired by Facebook Flux, by using EventEmitter',
  // URL to the Git repository containing the source code for this package.
  git: 'git@github.com:raohuaming/meteor-flux-store.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use([
    'raix:eventemitter@0.1.2',
    'underscore',
    'check',
    'reactive-dict'
  ], 'client');
  api.export(['FluxStore', 'FluxDispatcher'], 'client');
  api.addFiles('flux-store.js', 'client');
});

Package.onTest(function(api) {
  api.use([
    'sanjo:jasmine@0.13.3',
    'huaming:flux-store',
    'raix:eventemitter'
  ]);
  api.use('huaming:flux-store');
  api.addFiles([
    'tests/client/unit/flux-store-spec.js',
    'tests/client/unit/flux-dispatcher-spec.js'
  ], 'client');
});
