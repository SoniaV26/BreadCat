package com.breadgroup.BreadCat;

import javax.servlet.http.HttpServletRequest;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

public class CorsConfig implements CorsConfigurationSource {

	@Override
	public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
		CorsConfiguration corsConf = new CorsConfiguration();
		corsConf.addAllowedOrigin("http://localhost:4200");
		corsConf.addAllowedMethod("*");
		corsConf.applyPermitDefaultValues();
		corsConf.setAllowCredentials(true);
		return corsConf;
	}

}
