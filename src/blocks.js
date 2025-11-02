import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';

registerBlockType('myplugin/shortcode-block', {
    edit() {
        return <div {...useBlockProps()}>Shortcode Block Preview</div>;
    },
    save() {
        return null; // Rendered in PHP
    },
});
