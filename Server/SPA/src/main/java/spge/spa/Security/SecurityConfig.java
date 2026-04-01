package spge.spa.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        DelegatingPasswordEncoder delegatingPasswordEncoder =
                (DelegatingPasswordEncoder) PasswordEncoderFactories.createDelegatingPasswordEncoder();
        delegatingPasswordEncoder.setDefaultPasswordEncoderForMatches(new BCryptPasswordEncoder());
        return delegatingPasswordEncoder;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/User/register", "/User/login", "/User/guest-login", "/User/bootstrap-admin", "/hello").permitAll()
                .requestMatchers(HttpMethod.GET, "/User/profile-photo/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/User/*/profile-photo").hasAnyRole("EMPLOYEE", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/Role/views").authenticated()
                .requestMatchers(HttpMethod.GET, "/Location/**", "/Service/**").hasAnyRole("ADMIN", "EMPLOYEE", "CUSTOMER", "VIP")
                .requestMatchers("/User/admin/**").hasRole("ADMIN")
                .requestMatchers("/Role/**").hasRole("ADMIN")
                .requestMatchers("/VipRequest/pending", "/VipRequest/*/approve", "/VipRequest/*/reject").hasRole("ADMIN")
                .requestMatchers("/VipRequest/**").authenticated()
                .requestMatchers("/Booking/**").hasAnyRole("ADMIN", "EMPLOYEE", "CUSTOMER", "VIP")
                .requestMatchers("/Location/**", "/Service/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .cors(withDefaults());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
