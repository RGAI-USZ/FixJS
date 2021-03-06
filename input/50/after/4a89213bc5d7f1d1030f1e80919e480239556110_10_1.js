function(kernel, declare, Carousel, DataMixin){

	// module:
	//		dojox/mobile/DataCarousel
	// summary:
	//		A dojo/data-enabled Carousel.

	kernel.deprecated("dojox/mobile/DataCarousel is deprecated", "Use dojox/mobile/StoreCarousel instead", 2.0);
	return declare("dojox.mobile.DataCarousel", [Carousel, DataMixin], {
		// summary:
		//		A dojo/data-enabled Carousel.
		// description:
		//		DataCarousel is an enhanced version of dojox/mobile/Carousel. It
		//		can generate contents according to the given dojo/data store.
	});
}