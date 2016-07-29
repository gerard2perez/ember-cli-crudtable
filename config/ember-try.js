/*jshint node:true*/
module.exports = {
	bowerOptions: ['--silent', '--quiet'],
	scenarios: [
	{
			name: 'minimun',
			bower: {
				dependencies: {
					'ember': '2.4.6'
				}
			}
    }, {
			name: 'ember-release',
			allowedToFail: false,
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
