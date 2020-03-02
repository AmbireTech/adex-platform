export const removeTags = dirty => {
	if (!dirty) return ''

	return (
		dirty
			// Replace <strong>, <em>, <br>, <u>, <b> and <i> with {strong}, etc...
			.replace(/<(strong|em|br|\/?[ubi])>/gi, '{{$1}}')
			// Strip any remaining HTML tags
			.replace(/<(?:.|\n)*?>/gm, '')
			// Replace {strong} ... with <strong> ...
			.replace(/{{(strong|em|br|\/?[ubi])}}/gi, '<$1>')
	)
}
