package com.breadgroup.BreadCat;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.JdbcUserDetailsManager;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class UserController {
	@Autowired
	private H2Dao dao;
	@Autowired
	private JdbcUserDetailsManager userManager;
     
    @RequestMapping("/user")
	public Principal user(Principal user) {
    	return user;
	}
    
    @PostMapping("/join")
    public ResponseData addUser(@RequestBody UserData newUser) {
    	PasswordEncoder passEncoder = BasicAuthConfiguration.passwordEncoder();
    	
    	if (userManager.userExists(newUser.getUsername())) {
    		return new ResponseData(false, "Username is taken.");
    	}
    	
    	System.out.println("Adding user:\n\t"+newUser);
    	
    	List<GrantedAuthority> authorities = new ArrayList<GrantedAuthority>();
		authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
    	String encodedPassword = passEncoder.encode(newUser.getPassword());
    	
    	UserDetails newDetails = new User(newUser.getUsername(), encodedPassword, true, true, true, true, authorities);
    	userManager.createUser(newDetails);
    	
    	return new ResponseData(true, "");
    }
}