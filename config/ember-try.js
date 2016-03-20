/*jshint node:true*/
module.exports = {
	bowerOptions: ['--silent', '--quiet'],
	scenarios: [{
			name: 'default',
    }, {
			name: 'Ember 1.13',
			command: 'ember test --silent true',
			bower: {
				dependencies: {
					'ember': '~1.13.0'
				},
				resolutions: {
					'ember': '~1.13.0'
				}
			}
    }, {
			name: 'Ember Release',
			bower: {
				dependencies: {
					'ember': 'components/ember#release'
				},
				resolutions: {
					'ember': 'release'
				}
			}
    }, {
			name: 'Ember Beta',
			allowedToFail: true,
			bower: {
				dependencies: {
					'ember': 'components/ember#beta'
				},
				resolutions: {
					'ember': 'beta'
				}
			}
    }, {
			name: 'Ember Canary',
			allowedToFail: true,
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
