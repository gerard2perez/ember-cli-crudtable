/*jshint node:true*/
module.exports = {
	scenarios: [{
			name: 'default',
    }, {
			name: 'ember-1-13',
			command: 'ember test --filter ember-1-10',
			bower: {
				devDependencies: {
					'ember-cli-shims': '~0.0.6'
				},
				dependencies: {
					'ember': '~1.13.0',
					'ember-cli-htmlbars': '0.7.9'
				}
			}
    }, {
			name: 'ember-release',
			bower: {
				dependencies: {
					'ember': 'components/ember#release'
				},
				resolutions: {
					'ember': 'release'
				}
			}
    }, {
			name: 'ember-beta',
			bower: {
				dependencies: {
					'ember': 'components/ember#beta'
				},
				resolutions: {
					'ember': 'beta'
				}
			}
    }, {
			name: 'ember-canary',
			bower: {
				dependencies: {
					'ember': 'components/ember#canary'
				},
				resolutions: {
					'ember': 'canary'
				}
			}
    }
  ]
};
