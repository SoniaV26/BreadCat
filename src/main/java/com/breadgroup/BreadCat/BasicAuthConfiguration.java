package com.breadgroup.BreadCat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.JdbcUserDetailsManager;

@Configuration
@EnableWebSecurity
public class BasicAuthConfiguration extends WebSecurityConfigurerAdapter {
	@Autowired
    private JdbcTemplate jdbcTemplate;
	
	@Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
	
	@Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
		auth
		  .jdbcAuthentication()
		    .dataSource(jdbcTemplate.getDataSource())
			.usersByUsernameQuery("select username,password, enabled from users where username=?")
			.authoritiesByUsernameQuery("select username, authority from authorities where username=?")
			.passwordEncoder(passwordEncoder());     
    }
    
	@Bean
    @Override
    public JdbcUserDetailsManager userDetailsService() {
        JdbcUserDetailsManager manager = new JdbcUserDetailsManager();
        manager.setJdbcTemplate(jdbcTemplate);
        System.out.println(manager);
        return manager;
    }
 
    @Override
    protected void configure(HttpSecurity http) 
      throws Exception {
        http
          .httpBasic()
	    .and()
          .authorizeRequests()
            .antMatchers("/index.html", "/", "/home", "/login", "/join", "/logout", "/h2/*").permitAll()
            .anyRequest().authenticated()
        .and()
          .cors()
            .configurationSource(new CorsConfig())
        .and()
          .logout()
          .permitAll()
        .and()
          .csrf()
            .ignoringAntMatchers("/logout", "/join");
    }
}