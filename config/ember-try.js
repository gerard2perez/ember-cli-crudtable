/*jshint node:true*/
module.exports = {
	bowerOptions: ['--silent','--quiet'],
	scenarios: [{
			name: 'default',
    }, {
			name: 'ember-1-13',
			command: 'ember test --silent true',
			bower: {
				dependencies: {
					'ember': '~1.13.0'
				},
				resolutions:{
					'ember': '~1.13.0'
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
