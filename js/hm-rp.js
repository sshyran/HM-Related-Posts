/**
 * Custom jQuery for Custom Metaboxes and Fields
 */

/*jslint browser: true, devel: true, indent: 4, maxerr: 50, sub: true */
/*global jQuery, tb_show, tb_remove */

'use strict';

var HMRP = {

	_initCallbacks: [],
	_clonedFieldCallbacks: [],
	_deletedFieldCallbacks: [],

	init : function() {

		var _this = this;

		jQuery(document).ready( function () {

			jQuery( '.hm-rp-field.repeatable' ).each( function() {
				_this.isMinFields( jQuery(this) );
				_this.isMaxFields( jQuery(this) );
			} );

			jQuery( document ).on( 'click', '.hm-rp-delete-field', function(e) {
				e.preventDefault();
				_this.deleteField( jQuery( this ).closest('.hm-rp-field-item' ) );
			} );

			jQuery( document ).on( 'click', '.hm-rp-repeat-field', function(e) {
				e.preventDefault();
				_this.repeatField( jQuery( this ).closest('.hm-rp-field' ) );
			} );

			_this.doneInit();

		} );

	},

	repeatField : function( field ) {

	    var _this, templateField, newT, field, index, attr;

	    _this = this;

		if ( _this.isMaxFields( field, 1 ) )
			return;

	    templateField = field.children('.hm-rp-field-item.hidden');

	    newT = templateField.clone();
	    newT.removeClass('hidden');
	    newT.find('input[type!="button"]').not('[readonly]').val('');
	    newT.find( '.hm_rp_upload_status' ).html('');
	    newT.insertBefore( templateField );

	    // Recalculate group ids & update the name fields..
		index = 0;
		attr  = ['id','name','for','data-id','data-name'];

		field.children('.hm-rp-field-item').not( templateField ).each( function() {

			var search  = field.hasClass( 'HMRP_Group_Field' ) ? /hm-rp-group-(\d|x)*/g : /hm-rp-field-(\d|x)*/g;
			var replace = field.hasClass( 'HMRP_Group_Field' ) ? 'hm-rp-group-' + index : 'hm-rp-field-' + index;

			jQuery(this).find( '[' + attr.join('],[') + ']' ).each( function() {

				for ( var i = 0; i < attr.length; i++ )
					if ( typeof( jQuery(this).attr( attr[i] ) ) !== 'undefined' )
						jQuery(this).attr( attr[i], jQuery(this).attr( attr[i] ).replace( search, replace ) );

			} );

			index += 1;

		} );

	    _this.clonedField( newT );

	},

	deleteField : function( fieldItem  ) {

		var field = fieldItem.closest( '.hm-rp-field' );

	    if ( this.isMinFields( field, -1 ) )
	    	return;

		this.deletedField( fieldItem );
		fieldItem.remove();

	},

	/**
	 * Prevent having more than the maximum number of repeatable fields.
	 * When called, if there is the maximum, disable .hm-rp-repeat-field button.
	 * Note: Information Passed using data-max attribute on the .hm-rp-field element.
	 *
	 * @param jQuery .hm-rp-field
	 * @param int modifier - adjust count by this ammount. 1 If adding a field, 0 if checking, -1 if removing a field... etc
	 * @return null
	 */
	isMaxFields: function( field, modifier ) {

		var count, addBtn, min, max, count;

		modifier = (modifier) ? parseInt( modifier, 10 ) : 0;

		addBtn = field.children( '.hm-rp-repeat-field' );
		count  = field.children('.hm-rp-field-item').not('.hidden').length + modifier; // Count after anticipated action (modifier)
		max    = field.attr( 'data-rep-max' );

		// Show all the remove field buttons.
		field.find( '> .hm-rp-field-item > .hm-rp-delete-field' ).show();

		if ( typeof( max ) === 'undefined' )
			return false;

		// Disable the add new field button?
		if ( count >= parseInt( max, 10 ) )
			addBtn.attr( 'disabled', 'disabled' );

	    if ( count > parseInt( max, 10 ) )
	    	return true;

	},

	/**
	 * Prevent having less than minimum number of repeatable fields.
	 * When called, if there is the minimum, hide all 'remove' buttons.
	 * Note: Information Passed using data-min attribute on the .hm-rp-field element.
	 *
	 * @param  jQuery .hm-rp-field
	 * @param int modifier - adjust count by this ammount. 1 If adding a field, 0 if checking, -1 if removing a field... etc
	 * @return null
	 */
	isMinFields: function( field, modifier ) {

		var count, addBtn, min, max, count;

		modifier = (modifier) ? parseInt( modifier, 10 ) : 0;

		addBtn = field.children( '.hm-rp-repeat-field' );
		count  = field.children('.hm-rp-field-item').not('.hidden').length + modifier; // Count after anticipated action (modifier)
	    min    = field.attr( 'data-rep-min' );

	    addBtn.removeAttr( 'disabled' );

		if ( typeof( min ) === 'undefined' )
			return;

	    // Make sure at least the minimum number of fields exists.
	    while ( count < parseInt( min, 10 ) ) {
	    	this.repeatField( field );
	    	count = field.children('.hm-rp-field-item').not('.hidden').length;
	    }

	    // Hide the remove field buttons?
		if ( count <= parseInt( min, 10 ) )
			field.find( '> .hm-rp-field-item > .hm-rp-delete-field' ).hide();

		if ( count < parseInt( min, 10 ) )
			return true;

	},

	addCallbackForInit: function( callback ) {

		this._initCallbacks.push( callback )

	},

	/**
	 * Fire init callbacks.
	 * Called when HMRP has been set up.
	 */
	doneInit: function() {

		var _this = this,
			callbacks = _this._initCallbacks;

		if ( callbacks ) {
			for ( var a = 0; a < callbacks.length; a++) {
				callbacks[a]();
			}
		}

	},

	addCallbackForClonedField: function( fieldName, callback ) {

		if ( jQuery.isArray( fieldName ) )
			for ( var i = 0; i < fieldName.length; i++ )
				HMRP.addCallbackForClonedField( fieldName[i], callback );

		this._clonedFieldCallbacks[fieldName] = this._clonedFieldCallbacks[fieldName] ? this._clonedFieldCallbacks[fieldName] : []
		this._clonedFieldCallbacks[fieldName].push( callback )

	},

	/**
	 * Fire clonedField callbacks.
	 * Called when a field has been cloned.
	 */
	clonedField: function( el ) {

		var _this = this

		// also check child elements
		el.add( el.find( 'div[data-class]' ) ).each( function( i, el ) {

			el = jQuery( el )
			var callbacks = _this._clonedFieldCallbacks[el.attr( 'data-class') ]

			if ( callbacks )
				for ( var a = 0; a < callbacks.length; a++ )
					callbacks[a]( el );

		})
	},

	addCallbackForDeletedField: function( fieldName, callback ) {

		if ( jQuery.isArray( fieldName ) )
			for ( var i = 0; i < fieldName.length; i++ )
				HMRP._deletedFieldCallbacks( fieldName[i], callback );

		this._deletedFieldCallbacks[fieldName] = this._deletedFieldCallbacks[fieldName] ? this._deletedFieldCallbacks[fieldName] : []
		this._deletedFieldCallbacks[fieldName].push( callback )

	},

	/**
	 * Fire deletedField callbacks.
	 * Called when a field has been cloned.
	 */
	deletedField: function( el ) {

		var _this = this;

		// also check child elements
		el.add( el.find( 'div[data-class]' ) ).each( function(i, el) {

			el = jQuery( el )
			var callbacks = _this._deletedFieldCallbacks[el.attr( 'data-class') ]

			if ( callbacks )
				for ( var a = 0; a < callbacks.length; a++ )
					callbacks[a]( el )

		})
	}

}

jQuery(document).ready( function() {
	HMRP.init();
});
