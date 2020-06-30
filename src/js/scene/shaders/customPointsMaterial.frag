uniform vec3 diffuse;
uniform float opacity;
varying float positionY;
varying float vAlpha;

#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	// vAplha varie entre 1 et 0 et s'adapte à l'opacity actuelle pour ne jamais dépasser 1
	float customAlpha = opacity + (1.0 - opacity) * vAlpha;
	vec4 diffuseColor = vec4( diffuse, customAlpha );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	// after using texture png with diffuse color
	outgoingLight = diffuseColor.rgb;
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	#include <premultiplied_alpha_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}