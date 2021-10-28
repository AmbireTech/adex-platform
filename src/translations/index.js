// No automatic generation: we don't want to depend on fs, as we want to keep this universal
// ls *-*.json | while read line; do printf "\"`printf $line | cut -d '.' -f1`\": require(\"./$line\"),\n"; done
export default function() {
	return {
		'en-US': require('./en-US.json'),
	}
}

// ls *-*.json | while read line; do printf "\"`printf $line | cut -d '.' -f1`\",\n"; done
export const all = ['en-US']
export const onlyTranslated = ['en-US']
