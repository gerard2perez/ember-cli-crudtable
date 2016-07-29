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
			name: 'Ember Release',
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
